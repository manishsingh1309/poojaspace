import React from 'react';
import { ArrowRight, Image as ImageIcon, Sparkles, Plus, Play, Film } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { DriveFile } from '../../types/drive';
import { DriveImage } from '../common/DriveImage';

interface RecentMemoriesProps {
  onViewAllPhotos: () => void;
  onSelectFile: (file: DriveFile) => void;
  onAddPhotos?: () => void;
}

export const RecentMemories: React.FC<RecentMemoriesProps> = ({
  onViewAllPhotos,
  onSelectFile,
  onAddPhotos,
}) => {
  const { files } = useDrive();

  // Get real photos and videos uploaded to Drive, newest first
  const recentMedia = files
    .filter(
      (f) =>
        f.mimeType.startsWith('image/') ||
        f.mimeType.startsWith('video/') ||
        /\.(jpe?g|png|gif|webp|heic|mp4|mov|mkv|webm)$/i.test(f.name)
    )
    .slice(0, 6);

  if (recentMedia.length === 0) {
    return (
      <div className="luxury-glass-card rounded-3xl p-6 sm:p-7 border border-zinc-800/80 text-center space-y-3 relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto shadow-gold-glow">
          <ImageIcon className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-white tracking-tight">
            Your Visual Memories Wall
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Your photos and videos will appear here once saved or uploaded to Google Drive.
          </p>
        </div>
        {onAddPhotos && (
          <div className="pt-1">
            <button
              onClick={onAddPhotos}
              className="gold-button inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-gold-glow active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Your First Photo or Video</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h3 className="text-sm font-extrabold text-white tracking-tight">
            Recent Memories &amp; Clips
          </h3>
        </div>
        <button
          onClick={onViewAllPhotos}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 min-touch-target transition-colors"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {recentMedia.map((item) => {
          const isVideo =
            item.mimeType.startsWith('video/') ||
            /\.(mp4|mov|mkv|webm|3gp)$/i.test(item.name);

          return (
            <div
              key={item.id}
              onClick={() => onSelectFile(item)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-obsidian cursor-pointer hover:border-amber-400/50 hover:shadow-gold-glow-sm transition-all duration-300 active:scale-[0.98]"
            >
              <DriveImage
                file={item}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Video Play Badge if it's a video */}
              {isVideo && (
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 flex items-center justify-center transition-colors">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-gold-glow group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[9px] font-extrabold text-amber-300 flex items-center gap-1 border border-white/10">
                    <Film className="w-2.5 h-2.5" />
                    <span>VIDEO</span>
                  </div>
                </div>
              )}

              {/* Cinematic vignette overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 pt-8 flex flex-col justify-end text-left">
                <span className="text-white text-xs font-semibold truncate drop-shadow-sm">
                  {item.name.replace(/\.[^/.]+$/, '')}
                </span>
                {item.createdTime && (
                  <span className="text-amber-400/90 text-[10px] font-medium mt-0.5">
                    {new Date(item.createdTime).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
