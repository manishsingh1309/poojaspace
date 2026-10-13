import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { pathToView, navigateTo, subscribeToRoute, updateDocumentTitle } from './utils/router';
import { Layout } from './components/layout/Layout';
import { HeroBanner } from './components/home/HeroBanner';
import { WelcomeWaveGuide } from './components/home/WelcomeWaveGuide';
import { LiveStorageMeter } from './components/home/LiveStorageMeter';
import { RecentMemories } from './components/home/RecentMemories';
import { PersonalNote } from './components/home/PersonalNote';
import { FilterSearchBar } from './components/library/FilterSearchBar';
import { PhotoGallery } from './components/library/PhotoGallery';
import { DocumentList } from './components/library/DocumentList';

import { LightboxModal } from './components/library/LightboxModal';
import { FileDetailDrawer } from './components/library/FileDetailDrawer';
import { VideoPlayerModal } from './components/library/VideoPlayerModal';
import { AlbumGrid } from './components/albums/AlbumGrid';
import { AlbumDetailView } from './components/albums/AlbumDetailView';
import { RecentlyDeletedView } from './components/recovery/RecentlyDeletedView';
import { SettingsView } from './components/settings/SettingsView';
import { PrivacyView } from './components/settings/PrivacyView';
import { QuickAddModal } from './components/upload/QuickAddModal';
import { UploadQueueModal } from './components/upload/UploadQueueModal';
import { EmptyState } from './components/common/EmptyState';

import { ActiveView, FileCategory, SortOption } from './types/navigation';
import { DriveFile, DriveFolder } from './types/drive';
import { useDrive } from './context/DriveContext';
import { useUpload } from './context/UploadContext';
import { useAuth } from './context/AuthContext';
import { Image as ImageIcon, Plus, Video, FileText, Star, Sparkles } from 'lucide-react';


export const App: React.FC = () => {
  const initialRoute = useMemo(
    () => pathToView(typeof window !== 'undefined' ? window.location.pathname : '/'),
    []
  );
  const [activeView, setActiveView] = useState<ActiveView>(initialRoute.view);
  const [selectedAlbum, setSelectedAlbum] = useState<DriveFolder | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isGridView, setIsGridView] = useState(true);

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddFolderId, setQuickAddFolderId] = useState<string | undefined>(undefined);
  const [quickAddFolderName, setQuickAddFolderName] = useState<string | undefined>(undefined);

  const [lightboxFile, setLightboxFile] = useState<DriveFile | null>(null);
  const [drawerFile, setDrawerFile] = useState<DriveFile | null>(null);
  const [videoFile, setVideoFile] = useState<DriveFile | null>(null);

  const { files, knownFolders } = useDrive();
  const { isUploading, totalProgress, setQueueModalOpen } = useUpload();
  const { signIn } = useAuth();

  // Navigation handler synchronized with browser URL and history
  const handleNavigate = useCallback(
    (view: ActiveView, album?: DriveFolder) => {
      setActiveView(view);
      if (album) {
        setSelectedAlbum(album);
      } else if (view !== 'album_detail') {
        setSelectedAlbum(null);
      }

      navigateTo(view, {
        albumId: album?.id,
        albumName: album?.name,
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  // Subscribe to browser URL changes (popstate Back/Forward and direct deep links)
  useEffect(() => {
    // Check if arriving from Android Web Share Target
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('from_share') === 'true') {
        setQueueModalOpen(true);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    // Set initial title and resolve initial album if in /albums/:id
    updateDocumentTitle(initialRoute.view);
    if (initialRoute.albumId && knownFolders) {
      const album = knownFolders.customAlbums.find((a) => a.id === initialRoute.albumId);
      if (album) setSelectedAlbum(album);
    }

    const unsubscribe = subscribeToRoute((route) => {
      setActiveView(route.view);
      if (route.albumId && knownFolders) {
        const album = knownFolders.customAlbums.find((a) => a.id === route.albumId);
        if (album) setSelectedAlbum(album);
      } else if (route.view !== 'album_detail') {
        setSelectedAlbum(null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    return () => unsubscribe();
  }, [initialRoute, knownFolders, setQueueModalOpen]);

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Category filter
    if (selectedCategory === 'photos' || activeView === 'photos') {
      result = result.filter(
        (f) =>
          f.mimeType.startsWith('image/') ||
          /\.(jpe?g|png|gif|webp|heic|svg|bmp)$/i.test(f.name)
      );
    } else if (selectedCategory === 'videos' || activeView === 'videos') {
      result = result.filter(
        (f) =>
          f.mimeType.startsWith('video/') ||
          /\.(mp4|mov|mkv|webm|avi|3gp)$/i.test(f.name)
      );
    } else if (selectedCategory === 'documents' || activeView === 'documents') {
      result = result.filter(
        (f) =>
          f.mimeType.includes('pdf') ||
          f.mimeType.includes('document') ||
          f.mimeType.includes('text') ||
          f.mimeType.includes('sheet') ||
          f.mimeType.includes('msword') ||
          /\.(pdf|docx?|xlsx?|pptx?|txt|md|csv)$/i.test(f.name)
      );
    } else if (selectedCategory === 'audio_other') {
      result = result.filter(
        (f) =>
          !f.mimeType.startsWith('image/') &&
          !f.mimeType.startsWith('video/') &&
          !f.mimeType.includes('pdf') &&
          !f.mimeType.includes('document') &&
          !f.mimeType.includes('text')
      );
    }

    // Favourites view
    if (activeView === 'favourites') {
      result = result.filter((f) => f.appProperties?.favourite === 'true');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdTime || 0).getTime() - new Date(a.createdTime || 0).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.createdTime || 0).getTime() - new Date(b.createdTime || 0).getTime();
      }
      if (sortOption === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortOption === 'size_desc') {
        return (Number(b.size) || 0) - (Number(a.size) || 0);
      }
      if (sortOption === 'size_asc') {
        return (Number(a.size) || 0) - (Number(b.size) || 0);
      }
      return 0;
    });

    return result;
  }, [files, selectedCategory, activeView, searchQuery, sortOption]);

  const handleSelectFile = (file: DriveFile) => {
    if (file.mimeType.startsWith('image/')) {
      setLightboxFile(file);
    } else if (file.mimeType.startsWith('video/')) {
      setVideoFile(file);
    } else {
      setDrawerFile(file);
    }
  };

  const openQuickAddForFolder = (folderId?: string, folderName?: string) => {
    setQuickAddFolderId(folderId);
    setQuickAddFolderName(folderName);
    setIsQuickAddOpen(true);
  };

  return (
    <Layout
      activeView={activeView}
      onChangeView={(view) => handleNavigate(view)}
      onOpenQuickAdd={() => openQuickAddForFolder()}
    >
      {/* View router */}
      {activeView === 'home' && (
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          {/* Gentle welcome wave & one-tap guide on first landing */}
          <WelcomeWaveGuide
            onConnectDrive={signIn}
            onExplore={() => handleNavigate('photos')}
          />

          {/* Minimal, high-fashion Hero Banner */}
          <HeroBanner
            onQuickAdd={() => openQuickAddForFolder()}
            onExplorePhotos={() => handleNavigate('photos')}
          />

          {/* Dynamic Real Google Account Storage Meter */}
          <LiveStorageMeter />

          {/* Recent Memories Gallery */}
          <RecentMemories
            onViewAllPhotos={() => handleNavigate('photos')}
            onSelectFile={handleSelectFile}
            onAddPhotos={() => openQuickAddForFolder(knownFolders?.photosId, 'Photos')}
          />

          {/* Cherished Photo & Dedication: Made with love for Pooja didi */}
          <PersonalNote />
        </div>
      )}


      {activeView === 'photos' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                Photos &amp; Memories
              </h2>
              <p className="text-xs text-zinc-400">All your captured moments in one place</p>
            </div>
            <button
              onClick={() => openQuickAddForFolder(knownFolders?.photosId, 'Photos')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl gold-button text-xs font-semibold shadow-soft-float"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Photos</span>
            </button>
          </div>

          <FilterSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            sortOption={sortOption}
            onSortChange={setSortOption}
            isGridView={isGridView}
            onToggleGridView={setIsGridView}
            totalCount={filteredFiles.length}
          />

          {filteredFiles.length === 0 ? (
            <EmptyState
              icon={<ImageIcon className="w-8 h-8 text-gold-400" />}
              title="No photos found"
              description={
                searchQuery
                  ? 'No photos match your search query.'
                  : 'Add your first photo using Quick Add or Gallery Share.'
              }
              actionLabel="Quick add photos"
              onAction={() => openQuickAddForFolder(knownFolders?.photosId, 'Photos')}
              actionIcon={<Plus className="w-4 h-4" />}
            />
          ) : (
            <PhotoGallery files={filteredFiles} onSelectPhoto={handleSelectFile} />
          )}
        </div>
      )}

      {activeView === 'videos' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Videos</span>
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-xs text-zinc-400">Recorded clips and memories</p>
            </div>
            <button
              onClick={() => openQuickAddForFolder(knownFolders?.videosId, 'Videos')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl gold-button text-xs font-semibold shadow-soft-float"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Videos</span>
            </button>
          </div>

          <FilterSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory="videos"
            onSelectCategory={setSelectedCategory}
            sortOption={sortOption}
            onSortChange={setSortOption}
            isGridView={isGridView}
            onToggleGridView={setIsGridView}
            totalCount={filteredFiles.length}
          />

          {filteredFiles.length === 0 ? (
            <EmptyState
              icon={<Video className="w-8 h-8 text-gold-400" />}
              title="No videos found"
              description="Upload video clips to watch them safely anytime."
              actionLabel="Add video"
              onAction={() => openQuickAddForFolder(knownFolders?.videosId, 'Videos')}
              actionIcon={<Plus className="w-4 h-4" />}
            />
          ) : (
            <DocumentList files={filteredFiles} onSelectFile={handleSelectFile} />
          )}
        </div>
      )}

      {activeView === 'documents' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Documents &amp; Files</span>
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-xs text-zinc-400">PDFs, notes, receipts, and files</p>
            </div>
            <button
              onClick={() => openQuickAddForFolder(knownFolders?.documentsId, 'Documents')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl gold-button text-xs font-semibold shadow-soft-float"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add File</span>
            </button>
          </div>

          <FilterSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory="documents"
            onSelectCategory={setSelectedCategory}
            sortOption={sortOption}
            onSortChange={setSortOption}
            isGridView={isGridView}
            onToggleGridView={setIsGridView}
            totalCount={filteredFiles.length}
          />

          {filteredFiles.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-8 h-8 text-gold-400" />}
              title="No documents found"
              description="Upload certificates, receipts, or PDFs to access them on the go."
              actionLabel="Upload documents"
              onAction={() => openQuickAddForFolder(knownFolders?.documentsId, 'Documents')}
              actionIcon={<Plus className="w-4 h-4" />}
            />
          ) : (
            <DocumentList files={filteredFiles} onSelectFile={handleSelectFile} />
          )}
        </div>
      )}

      {activeView === 'albums' && (
        <AlbumGrid
          albums={knownFolders?.customAlbums || []}
          files={files}
          onSelectAlbum={(album) => handleNavigate('album_detail', album)}
        />
      )}

      {activeView === 'album_detail' && selectedAlbum && (
        <AlbumDetailView
          album={selectedAlbum}
          files={files}
          onBack={() => handleNavigate('albums')}
          onQuickAdd={(id, name) => openQuickAddForFolder(id, name)}
          onSelectFile={handleSelectFile}
        />
      )}

      {activeView === 'favourites' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Saved Memories</h2>
            <p className="text-xs text-zinc-400">Moments you marked with a heart</p>
          </div>

          {filteredFiles.length === 0 ? (
            <EmptyState
              icon={<Star className="w-8 h-8 text-gold-400" />}
              title="No favourites yet"
              description="Tap the star on any photo or file to keep it in your favourites."
            />
          ) : (
            <PhotoGallery files={filteredFiles} onSelectPhoto={handleSelectFile} />
          )}
        </div>
      )}

      {activeView === 'trash' && <RecentlyDeletedView />}
      {activeView === 'settings' && <SettingsView />}
      {activeView === 'privacy' && <PrivacyView />}

      {/* Floating Upload Progress Indicator on Mobile */}
      {isUploading && (
        <div className="fixed bottom-24 right-4 z-40 animate-fade-in">
          <button
            onClick={() => setQueueModalOpen(true)}
            className="flex items-center gap-2.5 bg-obsidian-card text-obsidian-text-primary px-4 py-2.5 rounded-full shadow-2xl border border-gold-500/30 active:scale-95 transition-all text-xs font-semibold backdrop-blur-md"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-ping" />
            <span className="text-gold-400 font-bold">Uploading {totalProgress}%</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultFolderId={quickAddFolderId}
        defaultFolderName={quickAddFolderName}
      />

      <UploadQueueModal />

      <LightboxModal
        isOpen={Boolean(lightboxFile)}
        onClose={() => setLightboxFile(null)}
        files={files.filter((f) => f.mimeType.startsWith('image/'))}
        currentFile={lightboxFile}
        onNavigate={(f) => setLightboxFile(f)}
        onOpenDetails={(f) => setDrawerFile(f)}
      />

      <FileDetailDrawer
        isOpen={Boolean(drawerFile)}
        onClose={() => setDrawerFile(null)}
        file={drawerFile}
      />

      <VideoPlayerModal
        isOpen={Boolean(videoFile)}
        onClose={() => setVideoFile(null)}
        file={videoFile}
      />
    </Layout>
  );
};
