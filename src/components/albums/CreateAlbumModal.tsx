import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FolderPlus } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlbumCreated: (albumId: string) => void;
}

export const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({
  isOpen,
  onClose,
  onAlbumCreated,
}) => {
  const [albumName, setAlbumName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createAlbum } = useDrive();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createAlbum(albumName.trim());
      setIsSubmitting(false);
      setAlbumName('');
      onClose();
      if (created) {
        onAlbumCreated(created.id);
      }
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Album" maxWidth="sm">
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-obsidian-text-primary mb-2 flex items-center gap-1.5">
            <FolderPlus className="w-3.5 h-3.5 text-gold-400" />
            <span>Album Name</span>
          </label>
          <input
            type="text"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            placeholder="e.g. Family Trip, Diwali, Special Moments"
            className="w-full text-sm font-medium bg-obsidian-surface border border-obsidian-border rounded-2xl px-4 py-2.5 text-obsidian-text-primary placeholder:text-obsidian-text-muted/60 focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-touch-target"
            autoFocus
            required
          />
        </div>

        <p className="text-[11px] text-obsidian-text-muted leading-relaxed">
          A dedicated folder will be created inside your Google Drive so your album remains organized everywhere.
        </p>

        <div className="flex gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            disabled={!albumName.trim()}
          >
            Create Album
          </Button>
        </div>
      </form>
    </Modal>
  );
};
