import React, { useState } from 'react';
import { DriveFile } from '../../types/drive';
import {
  Trash2,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { useDrive } from '../../context/DriveContext';

export const RecentlyDeletedView: React.FC = () => {
  const { trashedFiles, restoreFile, permanentDeleteFile } = useDrive();
  const [selectedFileForPermanentDelete, setSelectedFileForPermanentDelete] =
    useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleRestore = async (file: DriveFile) => {
    setRestoringId(file.id);
    try {
      await restoreFile(file.id);
    } finally {
      setRestoringId(null);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!selectedFileForPermanentDelete) return;
    setIsDeleting(true);
    try {
      await permanentDeleteFile(selectedFileForPermanentDelete.id);
      setSelectedFileForPermanentDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-obsidian-text-primary tracking-tight">
          Recently Deleted
        </h2>
        <p className="text-xs text-obsidian-text-muted">
          Restore files accidentally removed, or remove them permanently.
        </p>
      </div>

      {/* Reassurance Banner */}
      <div className="p-3.5 bg-obsidian-surface rounded-2xl border border-obsidian-border shadow-soft-sm flex items-start gap-3 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
        <div className="text-obsidian-text-secondary">
          <strong className="text-obsidian-text-primary">Your files are not lost.</strong> When you delete a file in Poojaspace, it is safely moved here. You can restore it to its original folder with one tap.
        </div>
      </div>

      {trashedFiles.length === 0 ? (
        <EmptyState
          icon={<Trash2 className="w-8 h-8 text-obsidian-text-muted/40" />}
          title="Trash is empty"
          description="You don't have any deleted files. Everything is safely in your library."
        />
      ) : (
        <div className="space-y-2.5">
          {trashedFiles.map((file) => {
            const isRestoring = restoringId === file.id;

            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-3.5 bg-obsidian-card rounded-2xl border border-obsidian-border hover:border-gold-500/30 transition-colors shadow-soft-sm"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  {file.thumbnailLink ? (
                    <img
                      src={file.thumbnailLink}
                      alt={file.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-obsidian-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-obsidian-surface border border-obsidian-border text-obsidian-text-muted flex items-center justify-center shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-obsidian-text-primary truncate">
                      {file.name}
                    </h4>
                    <p className="text-[11px] text-obsidian-text-muted mt-0.5">
                      {formatBytes(file.size)} •{' '}
                      {file.appProperties?.deletedAt
                        ? `Deleted ${new Date(
                            file.appProperties.deletedAt
                          ).toLocaleDateString()}`
                        : 'In trash'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(file)}
                    isLoading={isRestoring}
                    icon={<RotateCcw className="w-3.5 h-3.5 text-emerald-400" />}
                  >
                    Restore
                  </Button>

                  <button
                    onClick={() => setSelectedFileForPermanentDelete(file)}
                    className="p-2 text-rose-400/80 hover:text-rose-300 rounded-xl hover:bg-rose-500/10 transition-colors min-touch-target flex items-center justify-center"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Permanent Deletion */}
      <ConfirmDialog
        isOpen={Boolean(selectedFileForPermanentDelete)}
        onClose={() => setSelectedFileForPermanentDelete(null)}
        onConfirm={handleConfirmPermanentDelete}
        title="Delete Permanently?"
        message={`Are you sure you want to permanently delete "${selectedFileForPermanentDelete?.name}"? This action cannot be undone and will remove the file from your Google Drive.`}
        confirmLabel="Delete Forever"
        cancelLabel="Keep in Trash"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
