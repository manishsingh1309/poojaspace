import React, { useState } from 'react';
import { DriveFolder, DriveFile } from '../../types/drive';
import { Plus, FolderHeart, Image as ImageIcon } from 'lucide-react';
import { CreateAlbumModal } from './CreateAlbumModal';
import { DriveImage } from '../common/DriveImage';

interface AlbumGridProps {
  albums: DriveFolder[];
  files: DriveFile[];
  onSelectAlbum: (album: DriveFolder) => void;
}

export const AlbumGrid: React.FC<AlbumGridProps> = ({
  albums,
  files,
  onSelectAlbum,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Helper to find cover file for an album
  const getAlbumCoverFile = (albumId: string) => {
    return files.find(
      (f) =>
        f.parents?.includes(albumId) &&
        (f.mimeType.startsWith('image/') || f.thumbnailLink)
    ) || null;
  };

  // Helper to count files in an album
  const getAlbumCount = (albumId: string) => {
    return files.filter((f) => f.parents?.includes(albumId)).length;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-obsidian-text-primary tracking-tight">Your Albums</h2>
          <p className="text-xs text-obsidian-text-muted">Curated collections of your memories</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl gold-button text-xs font-semibold shadow-soft-float active:scale-95 transition-all min-touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>New Album</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* New Album Creation Card */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="aspect-square rounded-3xl border-2 border-dashed border-gold-500/30 hover:border-gold-500/60 bg-gold-500/5 hover:bg-gold-500/10 flex flex-col items-center justify-center p-4 text-center transition-all group min-touch-target"
        >
          <div className="w-12 h-12 rounded-2xl bg-obsidian-card border border-gold-500/30 text-gold-400 shadow-soft-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold text-obsidian-text-primary">Create Album</span>
          <span className="text-[10px] text-obsidian-text-muted mt-0.5">Organize memories</span>
        </button>

        {/* Existing Custom Albums */}
        {albums.map((album) => {
          const coverFile = getAlbumCoverFile(album.id);
          const count = getAlbumCount(album.id);

          return (
            <div
              key={album.id}
              onClick={() => onSelectAlbum(album)}
              className="group aspect-square rounded-3xl overflow-hidden bg-obsidian-card border border-obsidian-border hover:border-gold-500/50 shadow-soft-sm hover:shadow-soft transition-all cursor-pointer flex flex-col justify-between relative active:scale-[0.98]"
            >
              {/* Cover Image or Placeholder */}
              <div className="absolute inset-0 z-0 bg-obsidian-surface">
                {coverFile ? (
                  <DriveImage
                    file={coverFile}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold-500/30">
                    <FolderHeart className="w-12 h-12 stroke-[1.5]" />
                  </div>
                )}
                {/* Gradient overlay for readable text */}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-void via-obsidian-void/60 to-transparent" />
              </div>

              {/* Bottom Card Title */}
              <div className="relative z-10 p-3.5 flex flex-col justify-end h-full text-left">
                <span className="text-obsidian-text-primary text-sm font-bold truncate drop-shadow-xs">
                  {album.name}
                </span>
                <span className="text-gold-400/90 text-[11px] flex items-center gap-1 mt-0.5">
                  <ImageIcon className="w-3 h-3 text-gold-400" />
                  <span>{count} file{count === 1 ? '' : 's'}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <CreateAlbumModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAlbumCreated={(id) => {
          const found = albums.find((a) => a.id === id);
          if (found) onSelectAlbum(found);
        }}
      />
    </div>
  );
};
