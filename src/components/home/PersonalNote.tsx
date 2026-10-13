import React from 'react';
import { Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { POOJA_SPECIAL_IMAGE } from '../../assets/personalPhotos';

export const PersonalNote: React.FC = () => {
  return (
    <div className="luxury-glass-card rounded-3xl p-5 sm:p-6 border border-zinc-800/80 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 mt-6 mb-2">
      {/* Ambient solar gold glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Pooja's Cherished Photo with Golden Frame */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-amber-400 shadow-gold-glow p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 rotate-1">
        <img
          src={POOJA_SPECIAL_IMAGE}
          alt="Pooja didi"
          className="w-full h-full object-cover rounded-[14px]"
        />
      </div>

      <div className="flex-1 text-center sm:text-left relative z-10">
        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-extrabold text-amber-400 mb-1">
          <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Made with love for Pooja didi</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Your photos, videos, and documents stay safely preserved in your personal Google Drive forever. Never worry about phone memory again.
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Private Google Drive Vault</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-400/90">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Always Safe &amp; Preserved</span>
          </span>
        </div>
      </div>
    </div>
  );
};
