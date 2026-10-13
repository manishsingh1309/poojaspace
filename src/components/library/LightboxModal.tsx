import React, { useEffect } from 'react';
import { DriveFile } from '../../types/drive';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Download,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: DriveFile[];
  currentFile: DriveFile | null;
  onNavigate: (file: DriveFile) => void;
  onOpenDetails: (file: DriveFile) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  files,
  currentFile,
  onNavigate,
  onOpenDetails,
}) => {
  const { toggleFavourite } = useDrive();

  const currentIndex = currentFile
    ? files.findIndex((f) => f.id === currentFile.id)
    : -1;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1 && currentIndex !== -1;

  const handlePrev = () => {
    if (hasPrev) onNavigate(files[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onNavigate(files[currentIndex + 1]);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, currentIndex]);

  if (!isOpen || !currentFile) return null;

  const isFav = currentFile.appProperties?.favourite === 'true';

  return (
    <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-xl flex flex-col justify-between animate-fade-in safe-top safe-bottom">
      {/* Top action bar */}
      <div className="flex items-center justify-between p-4 text-white z-10 bg-gradient-to-b from-black/90 to-transparent">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="text-sm font-bold truncate text-white">
            {currentFile.name}
          </h3>
          <span className="text-[11px] text-amber-400/80 font-medium">
            {currentIndex + 1} of {files.length} •{' '}
            {currentFile.createdTime
              ? new Date(currentFile.createdTime).toLocaleDateString()
              : ''}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Favourite */}
          <button
            onClick={() => toggleFavourite(currentFile.id, !isFav)}
            aria-label="Toggle favourite"
            className="p-2.5 rounded-full hover:bg-zinc-800 text-white min-touch-target flex items-center justify-center transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                isFav ? 'fill-amber-400 text-amber-400' : 'text-zinc-400 hover:text-white'
              }`}
            />
          </button>

          {/* Details */}
          <button
            onClick={() => onOpenDetails(currentFile)}
            aria-label="File information"
            className="p-2.5 rounded-full hover:bg-zinc-800 text-white min-touch-target flex items-center justify-center transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* Download Original */}
          {currentFile.webContentLink && (
            <a
              href={currentFile.webContentLink}
              download={currentFile.name}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download original"
              className="p-2.5 rounded-full hover:bg-zinc-800 text-white min-touch-target flex items-center justify-center transition-colors"
            >
              <Download className="w-5 h-5" />
            </a>
          )}

          {/* Open in Drive */}
          {currentFile.webViewLink && (
            <a
              href={currentFile.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open in Google Drive"
              className="p-2.5 rounded-full hover:bg-zinc-800 text-amber-400 min-touch-target flex items-center justify-center transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close photo"
            className="p-2.5 rounded-full hover:bg-zinc-800 text-white min-touch-target flex items-center justify-center transition-colors ml-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main photo viewing canvas */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 select-none overflow-hidden">
        {/* Previous Button */}
        {hasPrev && (
          <button
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 z-20 min-touch-target flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {hasNext && (
          <button
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 z-20 min-touch-target flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* The Image */}
        <img
          src={currentFile.webContentLink || currentFile.thumbnailLink}
          alt={currentFile.name}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
        />
      </div>

      {/* Bottom spacer for gesture navigation bar */}
      <div className="h-4" />
    </div>
  );
};
