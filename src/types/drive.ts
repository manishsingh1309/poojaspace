export interface DriveAppProperties {
  favourite?: string; // 'true' | 'false'
  originalParentId?: string; // Folder ID before being moved to Recently Deleted
  deletedAt?: string; // ISO string timestamp when soft-deleted
  albumId?: string;
  category?: 'photos' | 'videos' | 'documents' | 'other';
  [key: string]: string | undefined;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number; // In bytes
  parents?: string[];
  createdTime?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  iconLink?: string;
  appProperties?: DriveAppProperties;
  trashed?: boolean;
}

export interface DriveFolder {
  id: string;
  name: string;
  parentId?: string;
}

export interface KnownFolders {
  rootId?: string;
  photosId?: string;
  videosId?: string;
  documentsId?: string;
  audioOtherId?: string;
  albumsRootId?: string;
  recentlyDeletedId?: string;
  customAlbums: DriveFolder[];
}

export interface DriveStorageStats {
  totalBytes: number;
  fileCount: number;
  photoCount: number;
  videoCount: number;
  documentCount: number;
  otherCount: number;
  albumCount: number;
  recentlyDeletedCount: number;
}

export interface GoogleUserProfile {
  email: string;
  name: string;
  picture?: string;
  id?: string;
}

export interface DriveApiResponse<T> {
  files?: T[];
  nextPageToken?: string;
  error?: {
    code: number;
    message: string;
    status?: string;
  };
}
