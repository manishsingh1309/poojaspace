import React from 'react';
import { Plus, Images, Heart } from 'lucide-react';
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
  const firstName = userProfile?.name?.split(' ')[0] || 'Pooja Didi';

  return (
    <div className="luxury-glass-card rounded-3xl p-5 sm:p-7 relative overflow-hidden border border-zinc-800/80 shadow-2xl">
      {/* Ambient solar gold atmospheric back-glow */}
      <div className="absolute -top-20 -right-20 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center gap-4 sm:gap-6">
        {/* Pooja's Editorial Portrait with Glowing Halo */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-gold-glow p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600">
            <img
              src={userProfile?.picture || POOJA_HERO_IMAGE}
              alt="Pooja"
              className="w-full h-full object-cover rounded-[22px]"
            />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 bg-zinc-950/90 border border-amber-400/60 px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 text-[10px] font-bold text-amber-400">
            <Heart className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>Vault</span>
          </div>
        </div>

        {/* Minimal Narrative & Direct Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-zinc-400 tracking-wide uppercase">
              {isAuthenticated ? 'Drive Connected' : 'Private Sanctuary'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
            {isAuthenticated ? `Namaste, ${firstName}` : "Pooja's Memories"}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            {isAuthenticated
              ? 'Stored safely in your personal Google Drive'
              : 'Every smile & memory preserved forever'}
          </p>

          {/* Minimal Essential Action Buttons Only */}
          <div className="flex items-center gap-2.5 mt-3.5">
            <button
              onClick={onQuickAdd}
              className="gold-button flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-gold-glow active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Memory</span>
            </button>

            <button
              onClick={onExplorePhotos}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-zinc-900/80 text-zinc-300 border border-zinc-700/70 hover:border-amber-400/50 hover:text-white font-semibold text-xs transition-all active:scale-95 shadow-sm"
            >
              <Images className="w-4 h-4 text-amber-400" />
              <span>Gallery</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
