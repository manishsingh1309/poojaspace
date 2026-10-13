import React from 'react';
import { Cloud, UploadCloud, Sun, Moon, Sparkles, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUpload } from '../../context/UploadContext';
import { useTheme } from '../../context/ThemeContext';
import { POOJA_HERO_IMAGE } from '../../assets/personalPhotos';

interface AppHeaderProps {
  onOpenMenu: () => void;
  onOpenQuickAdd: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenMenu }) => {
  const { isAuthenticated, userProfile, signIn } = useAuth();
  const { isUploading, totalProgress, setQueueModalOpen, queue } = useUpload();
  const { theme, toggleTheme } = useTheme();

  const activeCount = queue.filter(
    (i) => i.status === 'uploading' || i.status === 'queued'
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-[#09090E]/85 backdrop-blur-2xl border-b border-zinc-800/80 px-4 py-2.5 safe-top transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Avatar & Personal Title */}
        <div className="flex items-center gap-2.5">
          <div className="relative p-0.5 rounded-full border-2 border-amber-400/80 shrink-0">
            <img
              src={userProfile?.picture || POOJA_HERO_IMAGE}
              alt="Pooja"
              className="w-9 h-9 rounded-full object-cover shadow-sm"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#09090E] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-wider text-white uppercase font-sans">
                Poojaspace
              </span>
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-[11px] text-zinc-400">
              For <strong className="text-amber-400 font-semibold">Pooja Didi</strong>
            </p>
          </div>
        </div>

        {/* Right: Upload Status, Theme Switcher & Essential Actions */}
        <div className="flex items-center gap-2">
          {/* Active upload floating chip */}
          {isUploading && (
            <button
              onClick={() => setQueueModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-extrabold px-3 py-1.5 rounded-full shadow-gold-glow animate-pulse-gold active:scale-95 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 animate-bounce stroke-[2.5]" />
              <span>{totalProgress}%</span>
              <span className="text-[10px] opacity-80">({activeCount})</span>
            </button>
          )}

          {/* Theme Toggle Button (Light / Dark / Auto) */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch theme (current: ${theme})`}
            title={`Theme: ${theme.toUpperCase()} (Tap to change)`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-400/50 active:scale-95 transition-all min-touch-target"
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-500 uppercase hidden sm:inline">Light</span>
              </>
            ) : theme === 'dark' ? (
              <>
                <Moon className="w-4 h-4 text-amber-300" />
                <span className="text-[10px] font-bold text-amber-300 uppercase hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase hidden sm:inline">Auto</span>
              </>
            )}
          </button>

          {/* Cloud connection button / status */}
          {!isAuthenticated ? (
            <button
              onClick={signIn}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-400 hover:bg-amber-500/25 active:scale-95 transition-all min-touch-target shadow-sm"
            >
              <Cloud className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">Connect</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 font-semibold">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[11px] truncate max-w-[100px]">
                {userProfile?.name?.split(' ')[0] || 'Connected'}
              </span>
            </div>
          )}

          {/* Settings / Menu */}
          <button
            onClick={onOpenMenu}
            aria-label="Settings and options"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-xl transition-all min-touch-target flex items-center justify-center"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
