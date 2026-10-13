export type UploadStatus =
  | 'queued'
  | 'waiting_for_auth'
  | 'initializing_session'
  | 'uploading'
  | 'paused'
  | 'retrying'
  | 'needs_reconnect'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  progressPercentage: number; // 0 - 100
  bytesUploaded: number;
  targetFolderId?: string;
  targetFolderName?: string;
  resumableSessionUrl?: string;
  error?: string;
  retriesCount: number;
  createdAt: number;
  completedFileId?: string;
}

export interface PendingShareItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  timestamp: number;
}
