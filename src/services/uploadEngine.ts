import { UploadItem, UploadStatus } from '../types/upload';
import { driveApiClient } from './driveApiClient';
import { googleAuthService } from './googleAuthService';
import { mediaStreamService } from './mediaStreamService';

// Chunk size must be a multiple of 256 KiB (262,144 bytes).
// 1 MiB = 1,048,576 bytes = 4 * 256 KiB
const CHUNK_SIZE = 1024 * 1024;
const MAX_CONCURRENT_UPLOADS = 2;
const MAX_RETRIES = 4;

export class UploadEngine {
  private queue: UploadItem[] = [];
  private activeUploadsCount = 0;
  private listeners: Array<(items: UploadItem[]) => void> = [];
  private wakeLockSentinel: WakeLockSentinel | null = null;

  public subscribe(listener: (items: UploadItem[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.queue]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const copy = [...this.queue];
    this.listeners.forEach((l) => l(copy));
  }

  public getQueue(): UploadItem[] {
    return [...this.queue];
  }

  public addFiles(
    files: File[],
    targetFolderId?: string,
    targetFolderName?: string
  ): void {
    const newItems: UploadItem[] = files.map((file) => ({
      id: `up_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      status: 'queued',
      progressPercentage: 0,
      bytesUploaded: 0,
      targetFolderId,
      targetFolderName,
      retriesCount: 0,
      createdAt: Date.now(),
    }));

    this.queue = [...this.queue, ...newItems];
    this.notify();
    this.processNext();
  }

  public cancelUpload(id: string): void {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;

    if (item.status === 'uploading' || item.status === 'retrying') {
      item.status = 'cancelled';
      this.activeUploadsCount = Math.max(0, this.activeUploadsCount - 1);
    } else {
      item.status = 'cancelled';
    }

    this.notify();
    this.processNext();
  }

  public retryUpload(id: string): void {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;

    item.status = 'queued';
    item.error = undefined;
    item.retriesCount = 0;
    this.notify();
    this.processNext();
  }

  public clearCompleted(): void {
    this.queue = this.queue.filter(
      (i) => i.status !== 'completed' && i.status !== 'cancelled'
    );
    this.notify();
  }

  private async acquireWakeLock(): Promise<void> {
    if ('wakeLock' in navigator && !this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel = await navigator.wakeLock.request('screen');
      } catch (e) {
        // Safe ignore
      }
    }
  }

  private releaseWakeLock(): void {
    if (this.wakeLockSentinel) {
      this.wakeLockSentinel.release().catch(() => {});
      this.wakeLockSentinel = null;
    }
  }

  private processNext(): void {
    const token = googleAuthService.getToken();

    // If no token, transition queued items to waiting_for_auth
    if (!token) {
      this.queue.forEach((item) => {
        if (item.status === 'queued') {
          item.status = 'waiting_for_auth';
        }
      });
      this.notify();
      this.releaseWakeLock();
      return;
    }

    // Wake lock while uploads are pending or active
    const hasPending = this.queue.some(
      (i) =>
        i.status === 'queued' ||
        i.status === 'uploading' ||
        i.status === 'retrying' ||
        i.status === 'waiting_for_auth'
    );

    if (hasPending) {
      this.acquireWakeLock();
    } else {
      this.releaseWakeLock();
    }

    while (
      this.activeUploadsCount < MAX_CONCURRENT_UPLOADS &&
      this.queue.some((i) => i.status === 'queued' || i.status === 'waiting_for_auth')
    ) {
      const nextItem = this.queue.find(
        (i) => i.status === 'queued' || i.status === 'waiting_for_auth'
      );
      if (!nextItem) break;

      this.activeUploadsCount++;
      nextItem.status = 'initializing_session';
      this.notify();

      this.uploadItem(nextItem, token).finally(() => {
        this.activeUploadsCount = Math.max(0, this.activeUploadsCount - 1);
        this.processNext();
      });
    }
  }

  private async uploadItem(item: UploadItem, token: string): Promise<void> {
    try {
      // Step 1: Create Resumable Upload Session if not already created
      if (!item.resumableSessionUrl) {
        item.status = 'initializing_session';
        this.notify();

        const sessionUrl = await this.initiateResumableSession(item, token);
        item.resumableSessionUrl = sessionUrl;
      }

      // Step 2: Query already uploaded bytes (if resuming)
      let startByte = item.bytesUploaded;
      if (startByte > 0) {
        startByte = await this.querySessionStatus(item.resumableSessionUrl, item.size);
        item.bytesUploaded = startByte;
        item.progressPercentage = Math.round((startByte / item.size) * 100);
        this.notify();
      }

      // Step 3: Stream chunks
      item.status = 'uploading';
      this.notify();

      let uploadCompleteFileId: string | null = null;

      while (startByte < item.size) {
        if ((item.status as UploadStatus) === 'cancelled') {
          return;
        }

        const endByte = Math.min(startByte + CHUNK_SIZE, item.size) - 1;
        const chunkBlob = item.file.slice(startByte, endByte + 1);

        const result = await this.uploadChunk(
          item.resumableSessionUrl,
          chunkBlob,
          startByte,
          endByte,
          item.size
        );

        if (result.isComplete) {
          uploadCompleteFileId = result.fileId;
          startByte = item.size;
          item.bytesUploaded = item.size;
          item.progressPercentage = 100;
          break;
        } else {
          startByte = result.nextStartByte;
          item.bytesUploaded = startByte;
          item.progressPercentage = Math.round((startByte / item.size) * 100);
          this.notify();
        }
      }

      if (!uploadCompleteFileId) {
        throw new Error('Upload reached end without file ID confirmation');
      }

      // Step 4: Verification with Google Drive API
      item.status = 'verifying';
      this.notify();

      const verified = await driveApiClient.getFileMetadata(token, uploadCompleteFileId);
      if (!verified.id) {
        throw new Error('Metadata verification failed: File not found in Drive');
      }

      item.completedFileId = verified.id;
      item.completedFile = verified;
      // Pre-cache local file blob in mediaStreamService so it displays/streams instantly
      try {
        mediaStreamService.cacheLocalBlob(verified.id, item.file);
      } catch (e) {
        // Safe ignore
      }

      item.status = 'completed';
      item.progressPercentage = 100;
      item.bytesUploaded = item.size;
      this.notify();
    } catch (err: unknown) {
      if (item.status === 'cancelled') return;

      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('TOKEN_EXPIRED') || errorMessage.includes('401')) {
        item.status = 'needs_reconnect';
        item.error = 'Google authorization expired. Tap reconnect to resume.';
      } else if (errorMessage.includes('QUOTA_EXCEEDED') || errorMessage.includes('403')) {
        item.status = 'failed';
        item.error = 'Google Drive storage is full. Tap to manage account storage.';
      } else if (item.retriesCount < MAX_RETRIES) {
        item.retriesCount++;
        item.status = 'retrying';
        item.error = `Retrying (${item.retriesCount}/${MAX_RETRIES})...`;
        this.notify();

        // Bounded exponential backoff with jitter
        const backoffMs = Math.min(1000 * Math.pow(2, item.retriesCount) + Math.random() * 500, 10000);
        await new Promise((r) => setTimeout(r, backoffMs));

        // Re-attempt
        return this.uploadItem(item, token);
      } else {
        item.status = 'failed';
        item.error = errorMessage || 'Network upload interrupted';
      }

      this.notify();
    }
  }

  private async initiateResumableSession(
    item: UploadItem,
    token: string
  ): Promise<string> {
    const metadata: {
      name: string;
      mimeType: string;
      parents?: string[];
      appProperties?: Record<string, string>;
    } = {
      name: item.name,
      mimeType: item.type,
      appProperties: {
        uploadedVia: 'Poojaspace-PWA',
      },
    };

    if (item.targetFolderId) {
      metadata.parents = [item.targetFolderId];
    }

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': item.type,
          'X-Upload-Content-Length': item.size.toString(),
        },
        body: JSON.stringify(metadata),
      }
    );

    if (res.status === 401) {
      throw new Error('TOKEN_EXPIRED');
    }

    if (res.status === 403) {
      throw new Error('QUOTA_EXCEEDED');
    }

    if (!res.ok) {
      throw new Error(`Failed to initiate upload session (${res.status})`);
    }

    const location = res.headers.get('Location');
    if (!location) {
      throw new Error('Google Drive did not return resumable session Location header');
    }

    return location;
  }

  private async uploadChunk(
    sessionUrl: string,
    chunk: Blob,
    start: number,
    end: number,
    total: number
  ): Promise<{ isComplete: boolean; nextStartByte: number; fileId: string | null }> {
    const res = await fetch(sessionUrl, {
      method: 'PUT',
      headers: {
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Type': 'application/octet-stream',
      },
      body: chunk,
    });

    if (res.status === 200 || res.status === 201) {
      const data = await res.json();
      return {
        isComplete: true,
        nextStartByte: total,
        fileId: data.id || null,
      };
    }

    if (res.status === 308) {
      // Range: bytes=0-1048575
      const range = res.headers.get('Range');
      let nextStart = end + 1;
      if (range) {
        const match = range.match(/bytes=0-(\d+)/);
        if (match && match[1]) {
          nextStart = parseInt(match[1], 10) + 1;
        }
      }
      return {
        isComplete: false,
        nextStartByte: nextStart,
        fileId: null,
      };
    }

    if (res.status === 401) {
      throw new Error('TOKEN_EXPIRED');
    }

    if (res.status === 403) {
      throw new Error('QUOTA_EXCEEDED');
    }

    throw new Error(`Chunk upload failed with status ${res.status}`);
  }

  private async querySessionStatus(
    sessionUrl: string,
    totalSize: number
  ): Promise<number> {
    try {
      const res = await fetch(sessionUrl, {
        method: 'PUT',
        headers: {
          'Content-Range': `bytes */${totalSize}`,
        },
      });

      if (res.status === 308) {
        const range = res.headers.get('Range');
        if (range) {
          const match = range.match(/bytes=0-(\d+)/);
          if (match && match[1]) {
            return parseInt(match[1], 10) + 1;
          }
        }
      }
    } catch (e) {
      // Safe fallback to byte 0
    }
    return 0;
  }
}

export const uploadEngine = new UploadEngine();
