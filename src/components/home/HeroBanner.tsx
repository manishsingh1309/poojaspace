import React from 'react';
import { Plus, Images, Sparkles } from 'lucide-react';
import { POOJA_HERO_IMAGE } from '../../assets/personalPhotos';
import { useAuth } from '../../context/AuthContext';

interface HeroBannerProps {
  onQuickAdd: () => void;
  onExplorePhotos: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onQuickAdd,
  onExplorePhotos,
}) => {
  const { isAuthenticated, userProfile } = useAuth();
  const firstName = userProfile?.name?.split(' ')[0] || 'Pooja didi';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16161C] via-[#111115] to-[#0A0A0D] border border-zinc-800/80 shadow-obsidian-lg p-5 sm:p-7">
      {/* Ambient solar gold atmospheric back-glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center gap-5 sm:gap-6">
        {/* Pooja's Editorial Portrait */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-gold-glow p-0.5 bg-gradient-to-br from-amber-400 to-amber-600">
            <img
              src={userProfile?.picture || POOJA_HERO_IMAGE}
              alt="Pooja"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 bg-zinc-950 border border-amber-400/50 px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 text-[10px] font-semibold text-amber-400">
            <Sparkles className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>Vault</span>
          </div>
        </div>

        {/* Minimal Narrative & Direct Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-zinc-400">
              {isAuthenticated ? 'Google Drive Active' : 'Personal Memory Vault'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
            {isAuthenticated ? `Welcome, ${firstName}` : 'Poojaspace'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            {isAuthenticated
              ? 'Photos saved directly in your personal Google Drive'
              : 'Private sanctuary for your photos & memories'}
          </p>

          {/* Minimal Essential Action Buttons */}
          <div className="flex items-center gap-2.5 mt-3.5">
            <button
              onClick={onQuickAdd}
              className="gold-button flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-gold-glow active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Memory</span>
            </button>

            <button
              onClick={onExplorePhotos}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/80 text-zinc-300 border border-zinc-700/70 hover:border-amber-400/50 hover:text-white font-medium text-xs transition-all active:scale-95"
            >
              <Images className="w-3.5 h-3.5 text-amber-400" />
              <span>Gallery</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

