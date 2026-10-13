import React from 'react';
import { ArrowRight, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { DriveFile } from '../../types/drive';

interface RecentMemoriesProps {
  onViewAllPhotos: () => void;
  onSelectFile: (file: DriveFile) => void;
}

export const RecentMemories: React.FC<RecentMemoriesProps> = ({
  onViewAllPhotos,
  onSelectFile,
}) => {
  const { files } = useDrive();

  // Get recent photos (up to 6)
  const recentPhotos = files
    .filter((f) => f.mimeType.startsWith('image/'))
    .slice(0, 6);

  if (recentPhotos.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Memories from the Archive
          </h3>
        </div>
        <button
          onClick={onViewAllPhotos}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 min-touch-target transition-colors"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {recentPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => onSelectFile(photo)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-obsidian cursor-pointer hover:border-amber-400/50 hover:shadow-gold-glow-sm transition-all duration-300 active:scale-[0.98]"
          >
            {photo.thumbnailLink ? (
              <img
                src={photo.thumbnailLink}
                alt={photo.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}

            {/* Cinematic vignette overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 pt-8 flex flex-col justify-end text-left">
              <span className="text-white text-xs font-semibold truncate drop-shadow-sm">
                {photo.name.replace(/\.[^/.]+$/, '')}
              </span>
              {photo.createdTime && (
                <span className="text-amber-400/90 text-[10px] font-medium mt-0.5">
                  {new Date(photo.createdTime).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
