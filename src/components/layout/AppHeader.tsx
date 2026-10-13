import React from 'react';
import { Menu, Cloud, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUpload } from '../../context/UploadContext';
import { POOJA_HERO_IMAGE } from '../../assets/personalPhotos';

interface AppHeaderProps {
  onOpenMenu: () => void;
  onOpenQuickAdd: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenMenu }) => {
  const { isAuthenticated, userProfile, isConfigured } = useAuth();
  const { isUploading, totalProgress, setQueueModalOpen, queue } = useUpload();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const activeCount = queue.filter(
    (i) => i.status === 'uploading' || i.status === 'queued'
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-[#09090B]/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3 safe-top transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Avatar & Personal Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            aria-label="Open personal profile menu"
            className="relative group p-0.5 rounded-full border-2 border-amber-400/80 hover:border-amber-300 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <img
              src={userProfile?.picture || POOJA_HERO_IMAGE}
              alt="Pooja"
              className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#09090B] rounded-full" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-wider text-white uppercase font-sans">
                Poojaspace
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-zinc-400 font-normal">
              {getGreeting()}, <span className="font-semibold text-amber-400">Pooja didi</span>
            </p>
          </div>
        </div>

        {/* Right: Active Upload / Cloud Status & Menu */}
        <div className="flex items-center gap-2">
          {/* Active upload floating chip */}
          {isUploading && (
            <button
              onClick={() => setQueueModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-gold-glow animate-pulse-gold active:scale-95 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 animate-bounce stroke-[2.5]" />
              <span>{totalProgress}%</span>
              <span className="text-[10px] opacity-80">({activeCount})</span>
            </button>
          )}

          {/* Cloud connection indicator */}
          <button
            onClick={onOpenMenu}
            className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 shadow-sm transition-all"
          >
            <Cloud
              className={`w-3.5 h-3.5 ${
                isAuthenticated ? 'text-emerald-400' : 'text-amber-400'
              }`}
            />
            <span className="truncate max-w-[130px] font-medium">
              {isAuthenticated
                ? userProfile?.email || 'Google Drive'
                : isConfigured
                ? 'Connect Drive'
                : 'Demo Vault'}
            </span>
          </button>

          {/* Menu Drawer Toggle */}
          <button
            onClick={onOpenMenu}
            aria-label="Open menu options"
            className="p-2.5 text-zinc-300 hover:text-white hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800 rounded-2xl transition-all min-touch-target flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
