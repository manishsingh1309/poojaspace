import React from 'react';
import { DriveFile } from '../../types/drive';
import { Star, Image as ImageIcon } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

interface PhotoGalleryProps {
  files: DriveFile[];
  onSelectPhoto: (file: DriveFile) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  files,
  onSelectPhoto,
}) => {
  const { toggleFavourite } = useDrive();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
      {files.map((file) => {
        const isFav = file.appProperties?.favourite === 'true';

        return (
          <div
            key={file.id}
            onClick={() => onSelectPhoto(file)}
            className="group relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-obsidian hover:border-amber-400/60 hover:shadow-gold-glow-sm transition-all duration-300 cursor-pointer active:scale-[0.98]"
          >
            {/* Image */}
            {file.thumbnailLink ? (
              <img
                src={file.thumbnailLink}
                alt={file.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-zinc-600">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-[10px] text-zinc-500 text-center truncate max-w-full">
                  {file.name}
                </span>
              </div>
            )}

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

            {/* Bottom Caption Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 pt-8 flex flex-col justify-end text-left">
              <span className="text-white text-xs font-semibold truncate drop-shadow-sm">
                {file.name.replace(/\.[^/.]+$/, '')}
              </span>
              <div className="flex items-center justify-between text-[10px] text-amber-400/80 font-medium mt-0.5">
                <span>
                  {file.createdTime
                    ? new Date(file.createdTime).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : ''}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
