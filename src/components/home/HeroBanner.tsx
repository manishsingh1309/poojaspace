import React from 'react';
import { UploadCloud, Images, ShieldCheck, Sparkles } from 'lucide-react';
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
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16161C] via-[#111115] to-[#0A0A0D] border border-zinc-800/90 shadow-obsidian-lg p-6 sm:p-8 mb-6">
      {/* Ambient solar gold atmospheric back-glow */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Pooja's Editorial Portrait */}
        <div className="relative shrink-0">
          <div className="w-26 h-26 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-amber-400/90 shadow-gold-glow p-0.5 bg-gradient-to-br from-amber-400 to-amber-600">
            <img
              src={POOJA_HERO_IMAGE}
              alt="Pooja"
              className="w-full h-full object-cover rounded-[22px]"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-zinc-950 border border-amber-400/50 px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
            <Sparkles className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Pooja didi</span>
          </div>
        </div>

        {/* Text & Human Narrative */}
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 text-zinc-300 text-xs font-medium mb-3 border border-zinc-800 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct to Pooja&apos;s Google Drive • Zero Third-Party Server</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans leading-tight">
            Welcome to your space, Pooja
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-lg leading-relaxed">
            A serene, luxury sanctuary designed exclusively for your photographs, videos, and memories. Saved permanently in your own Google account, never deleting your phone originals.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-5">
            <button
              onClick={onQuickAdd}
              className="gold-button flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold min-touch-target"
            >
              <UploadCloud className="w-4 h-4 stroke-[2.5]" />
              <span>Quick add files</span>
            </button>

            <button
              onClick={onExplorePhotos}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 text-zinc-200 border border-zinc-700/80 hover:border-amber-400/60 hover:text-white font-medium text-xs sm:text-sm transition-all min-touch-target shadow-sm active:scale-95"
            >
              <Images className="w-4 h-4 text-amber-400" />
              <span>View gallery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reassuring note footer */}
      <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Tip: Select photos in Oppo Gallery → Share → Poojaspace to add instantly</span>
        </span>
        <span className="font-semibold text-amber-400">
          {isAuthenticated ? 'Drive Connected & Active' : 'Ready to preserve memories'}
        </span>
      </div>
    </div>
  );
};
