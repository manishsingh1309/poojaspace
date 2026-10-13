import React from 'react';
import { DriveFile } from '../../types/drive';
import {
  FileText,
  FileCode,
  Film,
  Music,
  Archive,
  ExternalLink,
  MoreVertical,
  Star,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

interface DocumentListProps {
  files: DriveFile[];
  onSelectFile: (file: DriveFile) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  files,
  onSelectFile,
}) => {
  const { toggleFavourite } = useDrive();

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return { icon: FileText, bg: 'bg-red-500/10 border-red-500/20 text-red-400' };
    }
    if (mimeType.includes('document') || mimeType.includes('msword')) {
      return { icon: FileText, bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' };
    }
    if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return { icon: FileText, bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
    }
    if (mimeType.startsWith('video/')) {
      return { icon: Film, bg: 'bg-amber-400/10 border-amber-400/20 text-amber-400' };
    }
    if (mimeType.startsWith('audio/')) {
      return { icon: Music, bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400' };
    }
    if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed')) {
      return { icon: Archive, bg: 'bg-zinc-800 border-zinc-700 text-zinc-300' };
    }
    return { icon: FileCode, bg: 'bg-amber-400/10 border-amber-400/20 text-amber-400' };
  };

  return (
    <div className="space-y-2.5 animate-fade-in">
      {files.map((file) => {
        const { icon: Icon, bg } = getFileIcon(file.mimeType);
        const isFav = file.appProperties?.favourite === 'true';

        return (
          <div
            key={file.id}
            onClick={() => onSelectFile(file)}
            className="flex items-center justify-between p-3.5 bg-[#121216] rounded-2xl border border-zinc-800 shadow-sm hover:border-amber-400/50 hover:bg-zinc-900 transition-all cursor-pointer active:scale-[0.99] group"
          >
            {/* Left: Icon & Details */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div
                className={`w-11 h-11 rounded-2xl ${bg} border flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  <span className="font-medium text-amber-400/80">{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>
                    {file.createdTime
                      ? new Date(file.createdTime).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Unknown date'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(file.id, !isFav);
                }}
                aria-label="Favourite"
                className="p-2 text-zinc-500 hover:text-amber-400 rounded-full hover:bg-zinc-800 transition-colors min-touch-target flex items-center justify-center"
              >
                <Star
                  className={`w-4 h-4 ${
                    isFav ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
              </button>

              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Open in Google Drive"
                  className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors min-touch-target flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFile(file);
                }}
                aria-label="More details"
                className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors min-touch-target flex items-center justify-center"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
