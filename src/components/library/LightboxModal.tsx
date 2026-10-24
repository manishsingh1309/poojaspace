import React, { useEffect, useState } from 'react';
import { DriveFile } from '../../types/drive';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Download,
  ExternalLink,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { useAuth } from '../../context/AuthContext';
import { mediaStreamService } from '../../services/mediaStreamService';
import { DriveImage } from '../common/DriveImage';

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
  const { token } = useAuth();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const currentIndex = currentFile
    ? files.findIndex((f) => f.id === currentFile.id)
    : -1;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1 && currentIndex !== -1;

  // Reset zoom on file change
  useEffect(() => {
    setZoomLevel(1);
  }, [currentFile?.id]);

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
      if (e.key === '+' || e.key === '=') setZoomLevel((z) => Math.min(z + 0.5, 3));
      if (e.key === '-') setZoomLevel((z) => Math.max(z - 0.5, 1));
      if (e.key === '0') setZoomLevel(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, currentIndex]);

  if (!isOpen || !currentFile) return null;

  const isFav = currentFile.appProperties?.favourite === 'true';

  const handleDownload = async () => {
    await mediaStreamService.downloadFile(currentFile, token);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && hasNext) {
        handleNext();
      } else if (diff < 0 && hasPrev) {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-xl flex flex-col justify-between animate-fade-in safe-top safe-bottom select-none">
      {/* Top action bar */}
      <div className="flex items-center justify-between p-4 text-white z-20 bg-gradient-to-b from-black/95 via-black/80 to-transparent">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="text-sm font-bold truncate text-white">
            {currentFile.name}
          </h3>
          <span className="text-[11px] text-amber-400/90 font-medium">
            {currentIndex + 1} of {files.length} •{' '}
            {currentFile.createdTime
              ? new Date(currentFile.createdTime).toLocaleDateString()
              : ''}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-zinc-900/80 rounded-full px-1.5 py-0.5 border border-zinc-800 mr-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.5, 1))}
              disabled={zoomLevel <= 1}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-zinc-300 font-mono w-9 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 3))}
              disabled={zoomLevel >= 3}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 text-amber-400 hover:text-amber-300"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

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

          {/* Authenticated Download */}
          <button
            onClick={handleDownload}
            aria-label="Download original"
            className="p-2.5 rounded-full hover:bg-zinc-800 text-white min-touch-target flex items-center justify-center transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>

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
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
      >
        {/* Previous Button */}
        {hasPrev && (
          <button
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 z-20 min-touch-target flex items-center justify-center transition-all shadow-xl active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {hasNext && (
          <button
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 z-20 min-touch-target flex items-center justify-center transition-all shadow-xl active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* The Image with Authenticated High-Res Fallback and Zoom */}
        <div
          className="relative max-h-full max-w-full transition-transform duration-200 flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <DriveImage
            file={currentFile}
            alt={currentFile.name}
            highRes={true}
            className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Bottom spacer for gesture navigation bar */}
      <div className="h-4" />
    </div>
  );
};
