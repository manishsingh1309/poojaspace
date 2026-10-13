import React from 'react';
import { Heart, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { POOJA_SPECIAL_IMAGE } from '../../assets/personalPhotos';

export const PersonalNote: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-[#16161C] via-[#121216] to-[#0D0D11] rounded-3xl p-5 sm:p-6 border border-zinc-800/90 shadow-obsidian mb-6 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
      {/* Ambient gold glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 border-2 border-amber-400/80 shadow-gold-glow-sm rotate-2 bg-zinc-950 p-0.5">
        <img
          src={POOJA_SPECIAL_IMAGE}
          alt="Special memory"
          className="w-full h-full object-cover rounded-[14px]"
        />
      </div>

      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-amber-400 mb-1">
          <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Made with love for Pooja didi</span>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Keep your photos, videos, and documents here without worrying about phone memory. Even if you reinstall or switch phones, all your files stay untouched in your private Google Drive.
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-[11px] text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Oppo ColorOS optimized</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero phone file deletion</span>
          </span>
        </div>
      </div>
    </div>
  );
};
