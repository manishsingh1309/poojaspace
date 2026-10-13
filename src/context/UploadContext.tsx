import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UploadItem, PendingShareItem } from '../types/upload';
import { uploadEngine } from '../services/uploadEngine';
import { indexedDbService } from '../services/indexedDbService';
import { useDrive } from './DriveContext';

interface UploadContextType {
  queue: UploadItem[];
  activeUploads: UploadItem[];
  pendingShares: PendingShareItem[];
  totalProgress: number;
  isUploading: boolean;
  addFiles: (files: File[], targetFolderId?: string, targetFolderName?: string) => void;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  clearCompleted: () => void;
  importPendingShares: () => Promise<void>;
  discardPendingShare: (id: string) => Promise<void>;
  isQueueModalOpen: boolean;
  setQueueModalOpen: (open: boolean) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<UploadItem[]>(uploadEngine.getQueue());
  const [pendingShares, setPendingShares] = useState<PendingShareItem[]>([]);
  const [isQueueModalOpen, setQueueModalOpen] = useState(false);
  const { refreshFiles, knownFolders } = useDrive();

  // Subscribe to UploadEngine updates
  useEffect(() => {
    const unsubscribe = uploadEngine.subscribe((items) => {
      setQueue(items);

      // Check if any item just completed
      const hasCompleted = items.some((i) => i.status === 'completed');
      if (hasCompleted) {
        refreshFiles();
      }
    });

    return () => unsubscribe();
  }, [refreshFiles]);

  // Load pending shares from IndexedDB (e.g. from Web Share Target)
  const refreshPendingShares = useCallback(async () => {
    try {
      const shares = await indexedDbService.getPendingShares();
      setPendingShares(shares);
    } catch (e) {
      // Safe ignore
    }
  }, []);

  useEffect(() => {
    refreshPendingShares();

    // Check if query param ?from_share=true is present
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('from_share') === 'true') {
        // Clean URL parameter without reload
        url.searchParams.delete('from_share');
        window.history.replaceState({}, '', url.pathname + url.search);
        refreshPendingShares();
        setQueueModalOpen(true);
      }
    }
  }, [refreshPendingShares]);

  const addFiles = (files: File[], targetFolderId?: string, targetFolderName?: string) => {
    if (files.length === 0) return;
    const folderId = targetFolderId || knownFolders?.photosId;
    const folderName = targetFolderName || 'Photos';
    uploadEngine.addFiles(files, folderId, folderName);
    setQueueModalOpen(true);
  };

  const cancelUpload = (id: string) => {
    uploadEngine.cancelUpload(id);
  };

  const retryUpload = (id: string) => {
    uploadEngine.retryUpload(id);
  };

  const clearCompleted = () => {
    uploadEngine.clearCompleted();
  };

  const importPendingShares = async () => {
    if (pendingShares.length === 0) return;
    const filesToUpload = pendingShares.map((p) => p.file);
    addFiles(filesToUpload);
    await indexedDbService.clearPendingShares();
    setPendingShares([]);
  };

  const discardPendingShare = async (id: string) => {
    await indexedDbService.removePendingShare(id);
    setPendingShares((prev) => prev.filter((p) => p.id !== id));
  };

  const activeUploads = queue.filter(
    (i) => i.status === 'uploading' || i.status === 'initializing_session' || i.status === 'verifying'
  );

  const isUploading = activeUploads.length > 0;

  // Calculate weighted progress percentage
  const totalBytes = queue.reduce((sum, item) => sum + item.size, 0);
  const uploadedBytes = queue.reduce((sum, item) => sum + item.bytesUploaded, 0);
  const totalProgress = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;

  return (
    <UploadContext.Provider
      value={{
        queue,
        activeUploads,
        pendingShares,
        totalProgress,
        isUploading,
        addFiles,
        cancelUpload,
        retryUpload,
        clearCompleted,
        importPendingShares,
        discardPendingShare,
        isQueueModalOpen,
        setQueueModalOpen,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = (): UploadContextType => {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUpload must be used within an UploadProvider');
  return ctx;
};
