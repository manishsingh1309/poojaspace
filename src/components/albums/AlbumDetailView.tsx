import React from 'react';
import { DriveFolder, DriveFile } from '../../types/drive';
import { ArrowLeft, Plus, FolderHeart, Image as ImageIcon } from 'lucide-react';
import { PhotoGallery } from '../library/PhotoGallery';
import { DocumentList } from '../library/DocumentList';
import { EmptyState } from '../common/EmptyState';

interface AlbumDetailViewProps {
  album: DriveFolder;
  files: DriveFile[];
  onBack: () => void;
  onQuickAdd: (albumId: string, albumName: string) => void;
  onSelectFile: (file: DriveFile) => void;
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({
  album,
  files,
  onBack,
  onQuickAdd,
  onSelectFile,
}) => {
  const albumFiles = files.filter((f) => f.parents?.includes(album.id));
  const photoFiles = albumFiles.filter((f) => f.mimeType.startsWith('image/'));
  const otherFiles = albumFiles.filter((f) => !f.mimeType.startsWith('image/'));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Navigation & Album Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back to albums"
            className="p-2 rounded-2xl bg-obsidian-card border border-obsidian-border text-obsidian-text-secondary hover:text-gold-400 min-touch-target flex items-center justify-center shadow-xs transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-gold-400" />
              <h2 className="text-lg font-bold text-obsidian-text-primary tracking-tight">
                {album.name}
              </h2>
            </div>
            <p className="text-xs text-obsidian-text-muted">
              {albumFiles.length} file{albumFiles.length === 1 ? '' : 's'} in this album
            </p>
          </div>
        </div>

        <button
          onClick={() => onQuickAdd(album.id, album.name)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl gold-button text-xs font-semibold shadow-soft-float active:scale-95 transition-all min-touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>Add to album</span>
        </button>
      </div>

      {albumFiles.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-8 h-8 text-gold-400" />}
          title="This album is empty"
          description="Start adding photos, videos, or documents to this album."
          actionLabel="Add files now"
          onAction={() => onQuickAdd(album.id, album.name)}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : (
        <div className="space-y-6">
          {photoFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-obsidian-text-primary mb-3">Photos</h3>
              <PhotoGallery files={photoFiles} onSelectPhoto={onSelectFile} />
            </div>
          )}

          {otherFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-obsidian-text-primary mb-3">Files &amp; Media</h3>
              <DocumentList files={otherFiles} onSelectFile={onSelectFile} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
