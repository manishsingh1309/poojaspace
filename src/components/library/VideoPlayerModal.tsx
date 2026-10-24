import React, { useState, useEffect, useRef } from 'react';
import { DriveFile } from '../../types/drive';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { mediaStreamService } from '../../services/mediaStreamService';
import {
  ExternalLink,
  Download,
  Film,
  Play,
  Cloud,
  AlertCircle,
  Loader2,
} from 'lucide-react';

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
  const { token } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Playback mode: 'direct' (HTML5 with authenticated blob stream) or 'cloud' (Drive embed iframe)
  const [playerMode, setPlayerMode] = useState<'direct' | 'cloud'>('direct');
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  useEffect(() => {
    if (!isOpen || !file) {
      setStreamUrl(null);
      setIsLoadingStream(false);
      setStreamError(null);
      return;
    }

    // Reset state for new file
    setPlayerMode('direct');
    setStreamError(null);

    // If local demo asset or blob
    if (file.thumbnailLink?.startsWith('/assets/') || file.id.startsWith('demo_') || file.id.startsWith('blob:')) {
      const demoUrl = file.webContentLink || file.thumbnailLink || '';
      setStreamUrl(demoUrl);
      return;
    }

    // Check if we already have a cached blob in memory
    const cached = mediaStreamService.getCachedUrl(file.id);
    if (cached) {
      setStreamUrl(cached);
      return;
    }

    // Fetch authenticated blob stream
    let isCancelled = false;
    setIsLoadingStream(true);

    mediaStreamService
      .getMediaBlobUrl(file.id, token)
      .then((url) => {
        if (!isCancelled) {
          setStreamUrl(url);
          setIsLoadingStream(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Direct stream fetch failed, falling back to cloud stream:', err);
          setStreamError('Direct browser stream could not be loaded. Switched to Drive Cloud Stream.');
          setIsLoadingStream(false);
          // Auto fallback to cloud stream
          setPlayerMode('cloud');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, file, token]);

  if (!isOpen || !file) return null;

  const cloudEmbedUrl = mediaStreamService.getEmbedPreviewUrl(file.id);

  const handleDownload = async () => {
    if (file) {
      await mediaStreamService.downloadFile(file, token);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={file.name} maxWidth="lg">
      <div className="space-y-4">
        {/* Stream Mode Switcher Tabs */}
        <div className="flex items-center justify-between bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPlayerMode('direct')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all min-touch-target ${
                playerMode === 'direct'
                  ? 'bg-amber-400 text-black shadow-gold-glow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>In-App Player</span>
            </button>

            <button
              onClick={() => setPlayerMode('cloud')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all min-touch-target ${
                playerMode === 'cloud'
                  ? 'bg-amber-400 text-black shadow-gold-glow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Drive Cloud Stream</span>
            </button>
          </div>

          <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline px-2">
            {formatBytes(file.size)}
          </span>
        </div>

        {/* Video Player Display Canvas */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-obsidian flex items-center justify-center">
          {playerMode === 'direct' ? (
            <>
              {isLoadingStream && (
                <div className="absolute inset-0 z-10 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mb-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-white">Streaming Video...</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                    Buffering stream directly from your Google Drive into the player.
                  </p>
                </div>
              )}

              {streamUrl ? (
                <video
                  ref={videoRef}
                  src={streamUrl}
                  controls
                  playsInline
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Your browser does not support HTML5 video preview.
                </video>
              ) : !isLoadingStream ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                  <Film className="w-12 h-12 mb-3 text-amber-400" />
                  <p className="text-sm font-semibold text-white">Direct stream unavailable</p>
                  <p className="text-xs text-zinc-500 mt-1 mb-3">
                    Try Drive Cloud Stream for full Google Drive transcoding.
                  </p>
                  <button
                    onClick={() => setPlayerMode('cloud')}
                    className="gold-button px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Switch to Cloud Stream
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            /* Drive Cloud Stream Player (iframe preview) */
            <iframe
              src={cloudEmbedUrl}
              title={file.name}
              allow="autoplay; fullscreen"
              className="w-full h-full border-0"
            />
          )}
        </div>

        {/* Stream notice or error alert */}
        {streamError && playerMode === 'cloud' && (
          <div className="bg-amber-400/10 border border-amber-400/30 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Streaming via Google Cloud Transcoder. All video formats supported!</span>
          </div>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="text-zinc-400 text-[11px]">
            <span>Added: </span>
            <span className="text-zinc-300 font-medium">
              {file.createdTime
                ? new Date(file.createdTime).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent'}
            </span>
            <span className="mx-1.5">•</span>
            <span>Size: </span>
            <span className="text-amber-400 font-semibold">{formatBytes(file.size)}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Authenticated Download Button */}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:border-amber-400/50 min-touch-target font-semibold transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download</span>
            </button>

            {/* Open in Google Drive Link */}
            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl gold-button min-touch-target font-bold active:scale-95 transition-all shadow-gold-glow-sm"
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
