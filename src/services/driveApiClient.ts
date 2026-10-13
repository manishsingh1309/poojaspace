import { DriveFile, DriveFolder, KnownFolders, DriveStorageStats, AccountStorageQuota } from '../types/drive';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

export class DriveApiClient {
  private async request<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${DRIVE_API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      throw new Error('TOKEN_EXPIRED');
    }

    if (res.status === 403) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody?.error?.message || '';
      if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('storage')) {
        throw new Error('QUOTA_EXCEEDED');
      }
      throw new Error(`PERMISSION_DENIED: ${message}`);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.error?.message || `Drive API error: ${res.status}`);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json() as Promise<T>;
  }

  /**
   * Idempotently finds or creates a folder with the given name under parentId.
   */
  public async discoverOrCreateFolder(
    token: string,
    name: string,
    parentId?: string
  ): Promise<string> {
    const parentQuery = parentId ? `'${parentId}' in parents` : `'root' in parents`;
    const escapedName = name.replace(/'/g, "\\'");
    const query = `mimeType = 'application/vnd.google-apps.folder' and name = '${escapedName}' and trashed = false and ${parentQuery}`;

    const searchUrl = `/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=1`;
    const searchRes = await this.request<{ files?: Array<{ id: string; name: string }> }>(
      searchUrl,
      token
    );

    if (searchRes.files && searchRes.files.length > 0) {
      return searchRes.files[0].id;
    }

    // Create folder
    const createBody = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId || 'root'],
    };

    const created = await this.request<{ id: string }>('/files?fields=id,name', token, {
      method: 'POST',
      body: JSON.stringify(createBody),
    });

    return created.id;
  }

  /**
   * Discovers or creates the full Poojaspace folder tree.
   */
  public async discoverOrCreateTree(token: string): Promise<KnownFolders> {
    // 1. Root Poojaspace folder
    const rootId = await this.discoverOrCreateFolder(token, 'Poojaspace');

    // 2. Standard Category subfolders
    const [
      photosId,
      videosId,
      documentsId,
      audioOtherId,
      albumsRootId,
      recentlyDeletedId,
    ] = await Promise.all([
      this.discoverOrCreateFolder(token, 'Photos', rootId),
      this.discoverOrCreateFolder(token, 'Videos', rootId),
      this.discoverOrCreateFolder(token, 'Documents', rootId),
      this.discoverOrCreateFolder(token, 'Audio & Other Files', rootId),
      this.discoverOrCreateFolder(token, 'Albums', rootId),
      this.discoverOrCreateFolder(token, 'Recently Deleted', rootId),
    ]);

    // 3. Discover user custom albums
    const albumsQuery = `mimeType = 'application/vnd.google-apps.folder' and '${albumsRootId}' in parents and trashed = false`;
    const albumList = await this.request<{ files?: Array<{ id: string; name: string }> }>(
      `/files?q=${encodeURIComponent(albumsQuery)}&fields=files(id,name)&pageSize=100`,
      token
    );

    const customAlbums: DriveFolder[] = (albumList.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      parentId: albumsRootId,
    }));

    return {
      rootId,
      photosId,
      videosId,
      documentsId,
      audioOtherId,
      albumsRootId,
      recentlyDeletedId,
      customAlbums,
    };
  }

  /**
   * List files within a folder or tree.
   */
  public async listFiles(
    token: string,
    options: {
      parentId?: string;
      parentIds?: string[];
      trashed?: boolean;
      pageToken?: string;
      pageSize?: number;
      search?: string;
      favouriteOnly?: boolean;
      category?: 'photos' | 'videos' | 'documents' | 'audio_other';
    } = {}
  ): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
    const conditions: string[] = [];

    // Trashed condition
    conditions.push(options.trashed ? 'trashed = true' : 'trashed = false');

    // Only actual files (not folders)
    conditions.push("mimeType != 'application/vnd.google-apps.folder'");

    // Parent filter
    if (options.parentId) {
      conditions.push(`'${options.parentId}' in parents`);
    } else if (options.parentIds && options.parentIds.length > 0) {
      const parentClauses = options.parentIds.map((p) => `'${p}' in parents`).join(' or ');
      conditions.push(`(${parentClauses})`);
    }

    // Favourite filter
    if (options.favouriteOnly) {
      conditions.push("appProperties has { key='favourite' and value='true' }");
    }

    // Search query
    if (options.search && options.search.trim()) {
      const escaped = options.search.trim().replace(/'/g, "\\'");
      conditions.push(`name contains '${escaped}'`);
    }

    // Category filter by MIME
    if (options.category === 'photos') {
      conditions.push("mimeType contains 'image/'");
    } else if (options.category === 'videos') {
      conditions.push("mimeType contains 'video/'");
    } else if (options.category === 'documents') {
      conditions.push(
        "(mimeType contains 'pdf' or mimeType contains 'document' or mimeType contains 'sheet' or mimeType contains 'presentation' or mimeType contains 'text/' or mimeType contains 'msword')"
      );
    }

    const query = conditions.join(' and ');
    const pageSize = options.pageSize || 50;
    const pageTokenParam = options.pageToken ? `&pageToken=${encodeURIComponent(options.pageToken)}` : '';
    const fields =
      'files(id,name,mimeType,size,parents,createdTime,modifiedTime,thumbnailLink,webContentLink,webViewLink,iconLink,appProperties,trashed),nextPageToken';

    const url = `/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(
      fields
    )}&pageSize=${pageSize}&orderBy=createdTime desc${pageTokenParam}`;

    const res = await this.request<{ files?: DriveFile[]; nextPageToken?: string }>(url, token);
    return {
      files: res.files || [],
      nextPageToken: res.nextPageToken,
    };
  }

  /**
   * Get single file metadata for verification or details.
   */
  public async getFileMetadata(token: string, fileId: string): Promise<DriveFile> {
    const fields =
      'id,name,mimeType,size,parents,createdTime,modifiedTime,thumbnailLink,webContentLink,webViewLink,iconLink,appProperties,trashed';
    return this.request<DriveFile>(
      `/files/${encodeURIComponent(fileId)}?fields=${encodeURIComponent(fields)}`,
      token
    );
  }

  /**
   * Rename a file.
   */
  public async renameFile(token: string, fileId: string, newName: string): Promise<DriveFile> {
    return this.request<DriveFile>(`/files/${encodeURIComponent(fileId)}?fields=id,name`, token, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName }),
    });
  }

  /**
   * Move file between folders.
   */
  public async moveFile(
    token: string,
    fileId: string,
    newParentId: string,
    previousParentId?: string
  ): Promise<DriveFile> {
    let url = `/files/${encodeURIComponent(fileId)}?addParents=${encodeURIComponent(newParentId)}`;
    if (previousParentId) {
      url += `&removeParents=${encodeURIComponent(previousParentId)}`;
    }
    url += '&fields=id,name,parents';
    return this.request<DriveFile>(url, token, { method: 'PATCH' });
  }

  /**
   * Toggle favourite property.
   */
  public async toggleFavourite(
    token: string,
    fileId: string,
    isFavourite: boolean
  ): Promise<DriveFile> {
    return this.request<DriveFile>(
      `/files/${encodeURIComponent(fileId)}?fields=id,name,appProperties`,
      token,
      {
        method: 'PATCH',
        body: JSON.stringify({
          appProperties: {
            favourite: isFavourite ? 'true' : 'false',
          },
        }),
      }
    );
  }

  /**
   * Soft-delete file into Recently Deleted folder.
   */
  public async softDeleteFile(
    token: string,
    fileId: string,
    currentParentId: string,
    recentlyDeletedFolderId: string
  ): Promise<DriveFile> {
    const url = `/files/${encodeURIComponent(fileId)}?addParents=${encodeURIComponent(
      recentlyDeletedFolderId
    )}&removeParents=${encodeURIComponent(currentParentId)}&fields=id,name,parents,appProperties`;

    return this.request<DriveFile>(url, token, {
      method: 'PATCH',
      body: JSON.stringify({
        appProperties: {
          originalParentId: currentParentId,
          deletedAt: new Date().toISOString(),
        },
      }),
    });
  }

  /**
   * Restore file from Recently Deleted back to its original parent.
   */
  public async restoreFile(
    token: string,
    fileId: string,
    originalParentId: string,
    recentlyDeletedFolderId: string
  ): Promise<DriveFile> {
    const url = `/files/${encodeURIComponent(fileId)}?addParents=${encodeURIComponent(
      originalParentId
    )}&removeParents=${encodeURIComponent(recentlyDeletedFolderId)}&fields=id,name,parents,appProperties`;

    return this.request<DriveFile>(url, token, {
      method: 'PATCH',
      body: JSON.stringify({
        appProperties: {
          originalParentId: null,
          deletedAt: null,
        },
      }),
    });
  }

  /**
   * Permanently delete file from Drive.
   */
  public async permanentDeleteFile(token: string, fileId: string): Promise<void> {
    await this.request<void>(`/files/${encodeURIComponent(fileId)}`, token, {
      method: 'DELETE',
    });
  }

  /**
   * Create a new custom album folder inside Albums root.
   */
  public async createAlbum(
    token: string,
    albumName: string,
    albumsRootFolderId: string
  ): Promise<DriveFolder> {
    const id = await this.discoverOrCreateFolder(token, albumName, albumsRootFolderId);
    return {
      id,
      name: albumName,
      parentId: albumsRootFolderId,
    };
  }

  /**
   * Compute truthful storage stats from all files inside Poojaspace folders.
   */
  public async computeStorageStats(
    token: string,
    knownFolders: KnownFolders
  ): Promise<DriveStorageStats> {
    const parentIds = [
      knownFolders.photosId,
      knownFolders.videosId,
      knownFolders.documentsId,
      knownFolders.audioOtherId,
      ...knownFolders.customAlbums.map((a) => a.id),
    ].filter(Boolean) as string[];

    if (parentIds.length === 0) {
      return {
        totalBytes: 0,
        fileCount: 0,
        photoCount: 0,
        videoCount: 0,
        documentCount: 0,
        otherCount: 0,
        albumCount: knownFolders.customAlbums.length,
        recentlyDeletedCount: 0,
      };
    }

    const { files } = await this.listFiles(token, {
      parentIds,
      pageSize: 1000,
    });

    let totalBytes = 0;
    let photoCount = 0;
    let videoCount = 0;
    let documentCount = 0;
    let otherCount = 0;

    files.forEach((file) => {
      const size = Number(file.size) || 0;
      totalBytes += size;

      if (file.mimeType.startsWith('image/')) {
        photoCount++;
      } else if (file.mimeType.startsWith('video/')) {
        videoCount++;
      } else if (
        file.mimeType.includes('pdf') ||
        file.mimeType.includes('document') ||
        file.mimeType.includes('text') ||
        file.mimeType.includes('sheet')
      ) {
        documentCount++;
      } else {
        otherCount++;
      }
    });

    // Check count in Recently Deleted
    let recentlyDeletedCount = 0;
    if (knownFolders.recentlyDeletedId) {
      const trashRes = await this.listFiles(token, {
        parentId: knownFolders.recentlyDeletedId,
        pageSize: 100,
      });
      recentlyDeletedCount = trashRes.files.length;
    }

    return {
      totalBytes,
      fileCount: files.length,
      photoCount,
      videoCount,
      documentCount,
      otherCount,
      albumCount: knownFolders.customAlbums.length,
      recentlyDeletedCount,
    };
  }

  /**
   * Fetch real Google account storage quota and user profile.
   */
  public async getAboutQuota(token: string): Promise<AccountStorageQuota> {
    try {
      const res = await this.request<{
        user?: { displayName?: string; emailAddress?: string; photoLink?: string };
        storageQuota?: { limit?: string; usage?: string; usageInDrive?: string };
      }>('/about?fields=user,storageQuota', token);

      const limit = Number(res.storageQuota?.limit) || 16106127360; // Default 15 GB if unreturned
      const usage = Number(res.storageQuota?.usage) || 0;
      const usageInDrive = Number(res.storageQuota?.usageInDrive) || 0;
      const freeBytes = Math.max(0, limit - usage);
      const percentUsed = Math.min(100, Math.round((usage / limit) * 100));

      return {
        limit,
        usage,
        usageInDrive,
        freeBytes,
        percentUsed,
        userDisplayName: res.user?.displayName,
        userEmail: res.user?.emailAddress,
        userPhoto: res.user?.photoLink,
      };
    } catch {
      // Graceful fallback if about endpoint restricted
      return {
        limit: 16106127360,
        usage: 0,
        usageInDrive: 0,
        freeBytes: 16106127360,
        percentUsed: 0,
      };
    }
  }
}

export const driveApiClient = new DriveApiClient();

