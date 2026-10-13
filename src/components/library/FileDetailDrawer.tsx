import React, { useState } from 'react';
import { DriveFile } from '../../types/drive';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Download,
  ExternalLink,
  Edit2,
  FolderInput,
  Star,
  Trash2,
  Check,
  Calendar,
  HardDrive,
  FileText,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

interface FileDetailDrawerProps {
  file: DriveFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FileDetailDrawer: React.FC<FileDetailDrawerProps> = ({
  file,
  isOpen,
  onClose,
}) => {
  const { renameFile, moveFile, toggleFavourite, softDeleteFile, knownFolders } =
    useDrive();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('');

  if (!file) return null;

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const isFav = file.appProperties?.favourite === 'true';

  const handleStartRename = () => {
    setNameInput(file.name);
    setIsEditingName(true);
  };

  const handleSaveRename = async () => {
    if (nameInput.trim() && nameInput.trim() !== file.name) {
      await renameFile(file.id, nameInput.trim());
    }
    setIsEditingName(false);
  };

  const handleMoveFolder = async () => {
    if (selectedFolder) {
      await moveFile(file.id, selectedFolder, file.parents?.[0]);
      setIsMoving(false);
    }
  };

  const handleDelete = async () => {
    await softDeleteFile(file.id, file.parents?.[0]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="File Details" maxWidth="md">
      <div className="space-y-5">
        {/* Thumbnail / Preview Header */}
        <div className="flex items-center gap-3.5 p-3.5 bg-obsidian-surface rounded-2xl border border-obsidian-border">
          {file.thumbnailLink ? (
            <img
              src={file.thumbnailLink}
              alt={file.name}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-obsidian-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full text-xs font-semibold bg-obsidian-void border border-gold-500/40 text-obsidian-text-primary rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1.5 gold-button rounded-lg min-touch-target flex items-center justify-center"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-1">
                <h4 className="text-sm font-bold text-obsidian-text-primary truncate">
                  {file.name}
                </h4>
                <button
                  onClick={handleStartRename}
                  className="p-1 text-obsidian-text-muted hover:text-gold-400 rounded-md transition-colors"
                  title="Rename"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <p className="text-xs text-obsidian-text-muted mt-0.5">
              {formatBytes(file.size)} • {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
            </p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 bg-obsidian-surface/60 rounded-2xl border border-obsidian-border">
            <span className="flex items-center gap-1.5 text-obsidian-text-muted font-medium mb-1">
              <Calendar className="w-3.5 h-3.5 text-gold-400" />
              <span>Added On</span>
            </span>
            <span className="font-semibold text-obsidian-text-primary block truncate">
              {file.createdTime
                ? new Date(file.createdTime).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Unknown'}
            </span>
          </div>

          <div className="p-3 bg-obsidian-surface/60 rounded-2xl border border-obsidian-border">
            <span className="flex items-center gap-1.5 text-obsidian-text-muted font-medium mb-1">
              <HardDrive className="w-3.5 h-3.5 text-gold-400" />
              <span>File Size</span>
            </span>
            <span className="font-semibold text-obsidian-text-primary block">
              {formatBytes(file.size)}
            </span>
          </div>
        </div>

        {/* Move to Album section */}
        {knownFolders && (
          <div className="bg-obsidian-surface p-3.5 rounded-2xl border border-obsidian-border">
            {isMoving ? (
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-obsidian-text-primary block">
                  Select destination album/folder:
                </label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full text-xs font-medium bg-obsidian-void border border-obsidian-border rounded-xl px-3 py-2 text-obsidian-text-primary focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                >
                  <option value="">Select a folder...</option>
                  <option value={knownFolders.photosId}>Photos</option>
                  <option value={knownFolders.videosId}>Videos</option>
                  <option value={knownFolders.documentsId}>Documents</option>
                  <option value={knownFolders.audioOtherId}>Audio &amp; Other Files</option>
                  {knownFolders.customAlbums.map((a) => (
                    <option key={a.id} value={a.id}>
                      Album: {a.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setIsMoving(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="primary" onClick={handleMoveFolder}>
                    Move here
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsMoving(true)}
                className="w-full flex items-center justify-between text-xs font-medium text-obsidian-text-secondary hover:text-gold-400 min-touch-target"
              >
                <div className="flex items-center gap-2">
                  <FolderInput className="w-4 h-4 text-gold-400" />
                  <span>Move to another Album / Folder</span>
                </div>
                <span className="text-gold-400 font-semibold">Change</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Favourite */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleFavourite(file.id, !isFav)}
            icon={
              <Star
                className={`w-4 h-4 ${
                  isFav ? 'fill-gold-400 text-gold-400' : 'text-obsidian-text-muted'
                }`}
              />
            }
          >
            {isFav ? 'Favourited' : 'Add to Favourite'}
          </Button>

          {/* Download Original */}
          {file.webContentLink && (
            <a
              href={file.webContentLink}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-medium text-xs px-3 py-2 gap-1.5 rounded-2xl border border-obsidian-border text-obsidian-text-primary bg-obsidian-surface hover:border-gold-500/40 min-touch-target transition-colors"
            >
              <Download className="w-4 h-4 text-gold-400" />
              <span>Download file</span>
            </a>
          )}

          {/* Open in Drive */}
          {file.webViewLink && (
            <a
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 inline-flex items-center justify-center font-medium text-xs px-3 py-2.5 gap-1.5 rounded-2xl border border-obsidian-border text-obsidian-text-primary bg-obsidian-surface hover:border-gold-500/40 min-touch-target transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gold-400" />
              <span>Open in Google Drive</span>
            </a>
          )}
        </div>

        {/* Soft Delete */}
        <div className="pt-2 border-t border-obsidian-border flex items-center justify-between">
          <p className="text-[11px] text-obsidian-text-muted">
            Files move to Recently Deleted and can be restored.
          </p>
          <button
            onClick={handleDelete}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 min-touch-target transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Move to Trash</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
