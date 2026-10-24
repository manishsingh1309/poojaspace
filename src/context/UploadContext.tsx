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
  const { refreshFiles, addUploadedFile, knownFolders } = useDrive();

  // Subscribe to UploadEngine updates
  useEffect(() => {
    const lastCompletedIds = new Set<string>();

    const unsubscribe = uploadEngine.subscribe((items) => {
      setQueue(items);

      // Check for newly completed items and add them immediately
      let anyNew = false;
      items.forEach((item) => {
        if (item.status === 'completed' && item.completedFile && !lastCompletedIds.has(item.id)) {
          lastCompletedIds.add(item.id);
          addUploadedFile(item.completedFile);
          anyNew = true;
        }
      });

      if (anyNew) {
        refreshFiles();
      }
    });

    return () => unsubscribe();
  }, [addUploadedFile, refreshFiles]);

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

    if (targetFolderId && targetFolderName) {
      uploadEngine.addFiles(files, targetFolderId, targetFolderName);
    } else {
      // Auto-categorize each file by type
      files.forEach((file) => {
        let fId = knownFolders?.photosId;
        let fName = 'Photos';

        if (file.type.startsWith('video/') || /\.(mp4|mov|mkv|webm|avi|3gp)$/i.test(file.name)) {
          fId = knownFolders?.videosId || fId;
          fName = 'Videos';
        } else if (
          file.type.includes('pdf') ||
          file.type.includes('document') ||
          file.type.includes('sheet') ||
          file.type.includes('text') ||
          /\.(pdf|docx?|xlsx?|txt|md|csv)$/i.test(file.name)
        ) {
          fId = knownFolders?.documentsId || fId;
          fName = 'Documents';
        } else if (file.type.startsWith('image/')) {
          fId = knownFolders?.photosId || fId;
          fName = 'Photos';
        } else {
          fId = knownFolders?.audioOtherId || fId;
          fName = 'Audio & Other Files';
        }

        uploadEngine.addFiles([file], fId, fName);
      });
    }

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
