import { DriveFile } from '../types/drive';

interface CacheEntry {
  url: string;
  blob?: Blob;
  timestamp: number;
}

class MediaStreamService {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<string>>();

  /**
   * Directly caches a local File or Blob (e.g. immediately after upload or selection)
   * so the photo or video is available for in-app viewing and streaming with 0 network latency.
   */
  public cacheLocalBlob(fileId: string, blob: Blob): string {
    // Revoke any existing URL for this ID
    this.revoke(fileId);

    const url = URL.createObjectURL(blob);
    this.cache.set(fileId, {
      url,
      blob,
      timestamp: Date.now(),
    });
    return url;
  }

  /**
   * Gets an in-memory cached URL if available.
   */
  public getCachedUrl(fileId: string): string | null {
    const entry = this.cache.get(fileId);
    return entry ? entry.url : null;
  }

  /**
   * Retrieves an authenticated Blob URL for any Google Drive file (photo, video, PDF).
   * Ensures private Google Drive files can be displayed in <img> or streamed in <video>.
   */
  public async getMediaBlobUrl(
    fileId: string,
    token?: string | null,
    fallbackUrl?: string
  ): Promise<string> {
    // 1. If it's already a blob or local asset URL, return as-is
    if (fileId.startsWith('blob:') || fileId.startsWith('/assets') || fileId.startsWith('data:')) {
      return fileId;
    }

    // 2. Check in-memory cache
    const cached = this.cache.get(fileId);
    if (cached) {
      return cached.url;
    }

    // 3. Deduplicate concurrent requests for the same fileId
    if (this.pendingRequests.has(fileId)) {
      return this.pendingRequests.get(fileId)!;
    }

    // 4. If no token, return fallback URL or error
    if (!token) {
      if (fallbackUrl) return fallbackUrl;
      throw new Error('NO_AUTH_TOKEN');
    }

    const fetchPromise = (async () => {
      try {
        const endpoint = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
          fileId
        )}?alt=media`;

        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Media fetch failed with status: ${res.status}`);
        }

        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);

        this.cache.set(fileId, {
          url: objectUrl,
          blob,
          timestamp: Date.now(),
        });

        return objectUrl;
      } catch (err) {
        if (fallbackUrl) {
          return fallbackUrl;
        }
        throw err;
      } finally {
        this.pendingRequests.delete(fileId);
      }
    })();

    this.pendingRequests.set(fileId, fetchPromise);
    return fetchPromise;
  }

  /**
   * Generates Google Drive's built-in preview/player iframe URL.
   * This provides Google's native video transcoder and player for large videos.
   */
  public getEmbedPreviewUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;
  }

  /**
   * Trigger an authenticated file download that works on Android and desktop
   * without encountering 302 redirects or unauthenticated download errors.
   */
  public async downloadFile(file: DriveFile, token?: string | null): Promise<void> {
    try {
      let downloadUrl = '';

      if (token && file.id && !file.id.startsWith('mock_') && !file.id.startsWith('demo_')) {
        // Fetch real blob with bearer token
        downloadUrl = await this.getMediaBlobUrl(file.id, token);
      } else {
        downloadUrl = file.webContentLink || file.thumbnailLink || '';
      }

      if (!downloadUrl) {
        throw new Error('No download link available');
      }

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name || 'download';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback: open in new tab if possible
      if (file.webViewLink) {
        window.open(file.webViewLink, '_blank', 'noopener,noreferrer');
      }
    }
  }

  /**
   * Revoke an object URL from memory to prevent leaks.
   */
  public revoke(fileId: string): void {
    const cached = this.cache.get(fileId);
    if (cached) {
      try {
        URL.revokeObjectURL(cached.url);
      } catch {
        // Safe ignore
      }
      this.cache.delete(fileId);
    }
  }

  /**
   * Clears all cached media URLs.
   */
  public clearAll(): void {
    this.cache.forEach((entry) => {
      try {
        URL.revokeObjectURL(entry.url);
      } catch {
        // Safe ignore
      }
    });
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

export const mediaStreamService = new MediaStreamService();
