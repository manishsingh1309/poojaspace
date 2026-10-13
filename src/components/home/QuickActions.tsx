import React from 'react';
import { Image as ImageIcon, Video, FileText, FolderHeart, Star, Trash2 } from 'lucide-react';
import { ActiveView } from '../../types/navigation';
import { useDrive } from '../../context/DriveContext';

interface QuickActionsProps {
  onSelectView: (view: ActiveView) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectView }) => {
  const { stats } = useDrive();

  const categories: Array<{
    id: ActiveView;
    title: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }> = [
    {
      id: 'photos',
      title: 'Photos',
      count: stats.photoCount,
      icon: ImageIcon,
      accent: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    },
    {
      id: 'videos',
      title: 'Cinema',
      count: stats.videoCount,
      icon: Video,
      accent: 'text-amber-300 bg-amber-300/10 border-amber-300/20',
    },
    {
      id: 'documents',
      title: 'Documents',
      count: stats.documentCount,
      icon: FileText,
      accent: 'text-zinc-300 bg-zinc-800 border-zinc-700',
    },
    {
      id: 'albums',
      title: 'Albums',
      count: stats.albumCount,
      icon: FolderHeart,
      accent: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    },
    {
      id: 'favourites',
      title: 'Starred',
      count: 0,
      icon: Star,
      accent: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    },
    {
      id: 'trash',
      title: 'Deleted',
      count: stats.recentlyDeletedCount,
      icon: Trash2,
      accent: 'text-red-400 bg-red-400/10 border-red-400/20',
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-white tracking-tight">Quick Vault</h3>
        <span className="text-xs text-zinc-500 font-medium">Browse by category</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectView(cat.id)}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#121216] border border-zinc-800/80 shadow-sm hover:border-amber-400/50 hover:bg-zinc-900 active:scale-95 transition-all min-touch-target text-center group"
            >
              <div className={`w-11 h-11 rounded-2xl ${cat.accent} border flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-zinc-200 group-hover:text-white leading-tight">
                {cat.title}
              </span>
              <span className="text-[10px] text-zinc-500 mt-0.5">
                {cat.count} files
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
