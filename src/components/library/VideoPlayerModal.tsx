import React from 'react';
import { DriveFile } from '../../types/drive';
import { Modal } from '../common/Modal';
import { ExternalLink, Download, Film } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: DriveFile | null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  if (!isOpen || !file) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={file.name} maxWidth="lg">
      <div className="space-y-4">
        {/* Video Player */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-obsidian-void border border-obsidian-border flex items-center justify-center">
          {file.webContentLink ? (
            <video
              src={file.webContentLink}
              controls
              playsInline
              className="w-full h-full object-contain"
            >
              Your browser does not support HTML5 video preview.
            </video>
          ) : (
            <div className="flex flex-col items-center justify-center text-obsidian-text-muted p-4 text-center">
              <Film className="w-12 h-12 mb-2 text-gold-400" />
              <p className="text-sm">Video stream direct from Drive</p>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-obsidian-text-muted">
            Videos can also be watched directly in Google Drive without loading into phone memory.
          </span>

          <div className="flex items-center gap-2">
            {file.webContentLink && (
              <a
                href={file.webContentLink}
                download={file.name}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-obsidian-border text-obsidian-text-primary bg-obsidian-surface hover:border-gold-500/40 min-touch-target font-medium transition-colors"
              >
                <Download className="w-4 h-4 text-gold-400" />
                <span>Download</span>
              </a>
            )}

            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl gold-button min-touch-target font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Drive</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
