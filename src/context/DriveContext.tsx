import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DriveFile, KnownFolders, DriveStorageStats, DriveFolder, AccountStorageQuota } from '../types/drive';
import { driveApiClient } from '../services/driveApiClient';
import { useAuth } from './AuthContext';
import { PERSONAL_MEMORY_PHOTOS } from '../assets/personalPhotos';

interface DriveContextType {
  knownFolders: KnownFolders | null;
  files: DriveFile[];
  trashedFiles: DriveFile[];
  stats: DriveStorageStats;
  accountQuota: AccountStorageQuota | null;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
  refreshFiles: () => Promise<void>;
  refreshTree: () => Promise<void>;
  renameFile: (id: string, name: string) => Promise<void>;
  moveFile: (id: string, newParentId: string, oldParentId?: string) => Promise<void>;
  toggleFavourite: (id: string, fav: boolean) => Promise<void>;
  softDeleteFile: (id: string, currentParentId?: string) => Promise<void>;
  restoreFile: (id: string, originalParentId?: string) => Promise<void>;
  permanentDeleteFile: (id: string) => Promise<void>;
  createAlbum: (name: string) => Promise<DriveFolder | null>;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

// Initial mock files created from Pooja's personal photos in assets/
const INITIAL_MOCK_FILES: DriveFile[] = PERSONAL_MEMORY_PHOTOS.map((mem, index) => ({
  id: `mock_${mem.id}`,
  name: `${mem.title}.jpg`,
  mimeType: 'image/jpeg',
  size: 1024 * 1024 * (1.2 + (index % 4) * 0.8), // ~1.2 - 3.6 MB
  parents: ['mock_photos_folder'],
  createdTime: new Date(Date.now() - index * 86400000 * 3).toISOString(),
  modifiedTime: new Date(Date.now() - index * 86400000 * 3).toISOString(),
  thumbnailLink: mem.src,
  webContentLink: mem.src,
  webViewLink: mem.src,
  appProperties: {
    favourite: index < 3 ? 'true' : 'false',
    caption: mem.caption,
  },
  trashed: false,
}));

export const DriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [knownFolders, setKnownFolders] = useState<KnownFolders | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [trashedFiles, setTrashedFiles] = useState<DriveFile[]>([]);
  const [accountQuota, setAccountQuota] = useState<AccountStorageQuota | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(!isAuthenticated);

  // Load or initialize Mock files
  const loadMockData = useCallback(() => {
    setIsMockMode(true);
    setKnownFolders({
      rootId: 'mock_root',
      photosId: 'mock_photos_folder',
      videosId: 'mock_videos_folder',
      documentsId: 'mock_docs_folder',
      audioOtherId: 'mock_other_folder',
      albumsRootId: 'mock_albums_root',
      recentlyDeletedId: 'mock_trash_folder',
      customAlbums: [
        { id: 'mock_album_family', name: 'Family & Festivals', parentId: 'mock_albums_root' },
        { id: 'mock_album_portraits', name: 'Portraits of Pooja', parentId: 'mock_albums_root' },
      ],
    });
    setFiles(INITIAL_MOCK_FILES);
    setTrashedFiles([]);
    setAccountQuota({
      limit: 16106127360, // 15 GB
      usage: 26424115, // ~25.2 MB
      usageInDrive: 26424115,
      freeBytes: 16106127360 - 26424115,
      percentUsed: 1,
      userDisplayName: 'Pooja didi',
      userEmail: 'pooja@gmail.com',
    });
  }, []);

  // Real Google Drive tree and files discovery
  const loadRealDriveData = useCallback(async (authToken: string) => {
    setIsLoading(true);
    setError(null);
    setIsMockMode(false);
    try {
      // Fetch REAL Google account quota directly from about.get API
      const quota = await driveApiClient.getAboutQuota(authToken);
      setAccountQuota(quota);

      const tree = await driveApiClient.discoverOrCreateTree(authToken);
      setKnownFolders(tree);

      const parentIds = [
        tree.photosId,
        tree.videosId,
        tree.documentsId,
        tree.audioOtherId,
        ...tree.customAlbums.map((a) => a.id),
      ].filter(Boolean) as string[];

      const activeFilesRes = await driveApiClient.listFiles(authToken, {
        parentIds,
        pageSize: 200,
      });
      setFiles(activeFilesRes.files);

      if (tree.recentlyDeletedId) {
        const trashRes = await driveApiClient.listFiles(authToken, {
          parentId: tree.recentlyDeletedId,
          pageSize: 100,
        });
        setTrashedFiles(trashRes.files);
      }
    } catch (err: unknown) {
      console.warn('Error loading Google Drive data:', err);
      const msg = err instanceof Error ? err.message : 'Failed to connect to Drive';
      setError(msg);
      // Fallback to local view
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  }, [loadMockData]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadRealDriveData(token);
    } else {
      loadMockData();
    }
  }, [isAuthenticated, token, loadRealDriveData, loadMockData]);


  const refreshFiles = async () => {
    if (isAuthenticated && token && knownFolders) {
      // Refresh live quota as well
      try {
        const quota = await driveApiClient.getAboutQuota(token);
        setAccountQuota(quota);
      } catch (err) {
        console.warn('Could not refresh quota:', err);
      }

      const parentIds = [
        knownFolders.photosId,
        knownFolders.videosId,
        knownFolders.documentsId,
        knownFolders.audioOtherId,
        ...knownFolders.customAlbums.map((a) => a.id),
      ].filter(Boolean) as string[];

      const activeFilesRes = await driveApiClient.listFiles(token, {
        parentIds,
        pageSize: 200,
      });
      setFiles(activeFilesRes.files);

      if (knownFolders.recentlyDeletedId) {
        const trashRes = await driveApiClient.listFiles(token, {
          parentId: knownFolders.recentlyDeletedId,
          pageSize: 100,
        });
        setTrashedFiles(trashRes.files);
      }
    }
  };

  const refreshTree = async () => {
    if (isAuthenticated && token) {
      await loadRealDriveData(token);
    }
  };

  const renameFile = async (id: string, newName: string) => {
    if (isMockMode || !token) {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
      );
      return;
    }

    await driveApiClient.renameFile(token, id, newName);
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
  };

  const moveFile = async (id: string, newParentId: string, oldParentId?: string) => {
    if (isMockMode || !token) {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, parents: [newParentId] } : f))
      );
      return;
    }

    await driveApiClient.moveFile(token, id, newParentId, oldParentId);
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, parents: [newParentId] } : f))
    );
  };

  const toggleFavourite = async (id: string, fav: boolean) => {
    if (isMockMode || !token) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                appProperties: {
                  ...f.appProperties,
                  favourite: fav ? 'true' : 'false',
                },
              }
            : f
        )
      );
      return;
    }

    await driveApiClient.toggleFavourite(token, id, fav);
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              appProperties: {
                ...f.appProperties,
                favourite: fav ? 'true' : 'false',
              },
            }
          : f
      )
    );
  };

  const softDeleteFile = async (id: string, currentParentId?: string) => {
    const file = files.find((f) => f.id === id);
    if (!file) return;

    const parent = currentParentId || file.parents?.[0] || knownFolders?.photosId || '';

    if (isMockMode || !token || !knownFolders?.recentlyDeletedId) {
      const updated: DriveFile = {
        ...file,
        parents: ['mock_trash_folder'],
        appProperties: {
          ...file.appProperties,
          originalParentId: parent,
          deletedAt: new Date().toISOString(),
        },
      };
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setTrashedFiles((prev) => [updated, ...prev]);
      return;
    }

    await driveApiClient.softDeleteFile(
      token,
      id,
      parent,
      knownFolders.recentlyDeletedId
    );
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setTrashedFiles((prev) => [
      {
        ...file,
        parents: [knownFolders.recentlyDeletedId!],
        appProperties: {
          ...file.appProperties,
          originalParentId: parent,
          deletedAt: new Date().toISOString(),
        },
      },
      ...prev,
    ]);
  };

  const restoreFile = async (id: string, originalParentId?: string) => {
    const file = trashedFiles.find((f) => f.id === id);
    if (!file) return;

    const targetParent =
      originalParentId ||
      file.appProperties?.originalParentId ||
      knownFolders?.photosId ||
      '';

    if (isMockMode || !token || !knownFolders?.recentlyDeletedId) {
      const restored: DriveFile = {
        ...file,
        parents: [targetParent],
        appProperties: {
          ...file.appProperties,
          originalParentId: undefined,
          deletedAt: undefined,
        },
      };
      setTrashedFiles((prev) => prev.filter((f) => f.id !== id));
      setFiles((prev) => [restored, ...prev]);
      return;
    }

    await driveApiClient.restoreFile(
      token,
      id,
      targetParent,
      knownFolders.recentlyDeletedId
    );
    setTrashedFiles((prev) => prev.filter((f) => f.id !== id));
    setFiles((prev) => [
      {
        ...file,
        parents: [targetParent],
        appProperties: {
          ...file.appProperties,
          originalParentId: undefined,
          deletedAt: undefined,
        },
      },
      ...prev,
    ]);
  };

  const permanentDeleteFile = async (id: string) => {
    if (isMockMode || !token) {
      setTrashedFiles((prev) => prev.filter((f) => f.id !== id));
      setFiles((prev) => prev.filter((f) => f.id !== id));
      return;
    }

    await driveApiClient.permanentDeleteFile(token, id);
    setTrashedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const createAlbum = async (name: string): Promise<DriveFolder | null> => {
    if (isMockMode || !token || !knownFolders?.albumsRootId) {
      const newAlbum: DriveFolder = {
        id: `mock_album_${Date.now()}`,
        name,
        parentId: 'mock_albums_root',
      };
      setKnownFolders((prev) =>
        prev
          ? {
              ...prev,
              customAlbums: [...prev.customAlbums, newAlbum],
            }
          : null
      );
      return newAlbum;
    }

    const album = await driveApiClient.createAlbum(token, name, knownFolders.albumsRootId);
    setKnownFolders((prev) =>
      prev
        ? {
            ...prev,
            customAlbums: [...prev.customAlbums, album],
          }
        : null
    );
    return album;
  };

  // Compute stats
  let totalBytes = 0;
  let photoCount = 0;
  let photoBytes = 0;
  let videoCount = 0;
  let videoBytes = 0;
  let documentCount = 0;
  let documentBytes = 0;
  let otherCount = 0;

  files.forEach((f) => {
    const s = Number(f.size) || 0;
    totalBytes += s;
    if (f.mimeType.startsWith('image/')) {
      photoCount++;
      photoBytes += s;
    } else if (f.mimeType.startsWith('video/')) {
      videoCount++;
      videoBytes += s;
    } else if (
      f.mimeType.includes('pdf') ||
      f.mimeType.includes('document') ||
      f.mimeType.includes('text') ||
      f.mimeType.includes('sheet')
    ) {
      documentCount++;
      documentBytes += s;
    } else {
      otherCount++;
    }
  });

  const stats: DriveStorageStats = {
    totalBytes,
    fileCount: files.length,
    photoCount,
    photoBytes,
    videoCount,
    videoBytes,
    documentCount,
    documentBytes,
    otherCount,
    albumCount: knownFolders?.customAlbums.length || 0,
    recentlyDeletedCount: trashedFiles.length,
  };

  return (
    <DriveContext.Provider
      value={{
        knownFolders,
        files,
        trashedFiles,
        stats,
        accountQuota,
        isLoading,
        error,
        isMockMode,
        refreshFiles,
        refreshTree,
        renameFile,
        moveFile,
        toggleFavourite,
        softDeleteFile,
        restoreFile,
        permanentDeleteFile,
        createAlbum,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
};

export const useDrive = (): DriveContextType => {
  const ctx = useContext(DriveContext);
  if (!ctx) throw new Error('useDrive must be used within a DriveProvider');
  return ctx;
};
