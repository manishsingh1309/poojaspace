import React from 'react';
import { DriveFile } from '../../types/drive';
import { Play, Star, Film } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { DriveImage } from '../common/DriveImage';

interface VideoGalleryProps {
  files: DriveFile[];
  onSelectVideo: (file: DriveFile) => void;
  isGridView?: boolean;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({
  files,
  onSelectVideo,
  isGridView = true,
}) => {
  const { toggleFavourite } = useDrive();

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (!isGridView) {
    // List View
    return (
      <div className="space-y-2.5 animate-fade-in">
        {files.map((file) => {
          const isFav = file.appProperties?.favourite === 'true';

          return (
            <div
              key={file.id}
              onClick={() => onSelectVideo(file)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#14141B] border border-zinc-800 hover:border-amber-400/50 hover:bg-zinc-900/90 transition-all cursor-pointer active:scale-[0.99] shadow-obsidian"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Video thumbnail with small play badge */}
                <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-800 flex items-center justify-center">
                  {file.thumbnailLink ? (
                    <DriveImage file={file} className="w-full h-full object-cover" />
                  ) : (
                    <Film className="w-6 h-6 text-amber-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-amber-400/90 text-black flex items-center justify-center shadow-md">
                      <Play className="w-3 h-3 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                    {file.name.replace(/\.[^/.]+$/, '')}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span>
                      {file.createdTime
                        ? new Date(file.createdTime).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite(file.id, !isFav);
                  }}
                  className="p-2 rounded-full text-zinc-400 hover:text-amber-400 min-touch-target"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isFav ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Grid View
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 animate-fade-in">
      {files.map((file) => {
        const isFav = file.appProperties?.favourite === 'true';

        return (
          <div
            key={file.id}
            onClick={() => onSelectVideo(file)}
            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#121218] border border-zinc-800 shadow-obsidian hover:border-amber-400/60 hover:shadow-gold-glow-sm transition-all duration-300 cursor-pointer active:scale-[0.98]"
          >
            {/* 16:9 Video Aspect Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
              {file.thumbnailLink ? (
                <DriveImage
                  file={file}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
                  <Film className="w-12 h-12 text-amber-400/40" />
                </div>
              )}

              {/* Glowing Play Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 flex items-center justify-center transition-colors">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-gold-glow group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-6 h-6 fill-black ml-1" />
                </div>
              </div>

              {/* Top Favourite Quick Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(file.id, !isFav);
                }}
                aria-label={isFav ? 'Remove favourite' : 'Add to favourites'}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-colors min-touch-target flex items-center justify-center border border-white/10"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    isFav
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                />
              </button>

              {/* Video Badge */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                <Film className="w-3 h-3" />
                <span>VIDEO</span>
              </div>

              {/* File size badge at bottom right */}
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-semibold text-zinc-300 border border-white/10">
                {formatBytes(file.size)}
              </div>
            </div>

            {/* Bottom Details Section */}
            <div className="p-3 bg-[#121218] border-t border-zinc-800/80">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                {file.name.replace(/\.[^/.]+$/, '')}
              </h3>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium mt-1">
                <span>
                  {file.createdTime
                    ? new Date(file.createdTime).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </span>
                <span className="text-amber-400 font-semibold group-hover:underline">
                  Stream Video →
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
