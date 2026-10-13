import React from 'react';
import { Sparkles, Image as ImageIcon, Plus, Heart, HardDrive } from 'lucide-react';
import { ActiveView } from '../../types/navigation';

interface BottomNavProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onChangeView,
  onOpenQuickAdd,
}) => {
  return (
    <nav className="fixed bottom-3 left-0 right-0 z-40 px-4 pointer-events-none safe-bottom">
      <div className="pointer-events-auto max-w-sm mx-auto glass-dock rounded-full px-4 py-1.5 flex items-center justify-between shadow-2xl relative">
        {/* Left Item 1: Home */}
        <button
          onClick={() => onChangeView('home')}
          className={`flex flex-col items-center justify-center min-touch-target px-2.5 py-1 rounded-full transition-all ${
            activeView === 'home'
              ? 'text-amber-400 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
          }`}
        >
          <Sparkles className={`w-5 h-5 transition-transform ${activeView === 'home' ? 'scale-110 text-amber-400' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Home</span>
          {activeView === 'home' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-gold-glow" />
          )}
        </button>

        {/* Left Item 2: Photos Gallery */}
        <button
          onClick={() => onChangeView('photos')}
          className={`flex flex-col items-center justify-center min-touch-target px-2.5 py-1 rounded-full transition-all ${
            activeView === 'photos'
              ? 'text-amber-400 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
          }`}
        >
          <ImageIcon className={`w-5 h-5 transition-transform ${activeView === 'photos' ? 'scale-110 text-amber-400' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Photos</span>
          {activeView === 'photos' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-gold-glow" />
          )}
        </button>

        {/* Central Sculpted Golden Upload Button */}
        <div className="relative -top-3 px-1">
          <button
            onClick={onOpenQuickAdd}
            aria-label="Upload photo or video to Google Drive"
            className="flex items-center justify-center w-13 h-13 rounded-full gold-button border-3 border-[#09090E] shadow-gold-glow active:scale-90 transition-transform focus:outline-none"
          >
            <Plus className="w-6 h-6 stroke-[3] text-black" />
          </button>
        </div>

        {/* Right Item 1: Saved / Favourites */}
        <button
          onClick={() => onChangeView('favourites')}
          className={`flex flex-col items-center justify-center min-touch-target px-2.5 py-1 rounded-full transition-all ${
            activeView === 'favourites'
              ? 'text-amber-400 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
          }`}
        >
          <Heart className={`w-5 h-5 transition-transform ${activeView === 'favourites' ? 'scale-110 text-amber-400 fill-amber-400' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Saved</span>
          {activeView === 'favourites' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-gold-glow" />
          )}
        </button>

        {/* Right Item 2: Storage & Settings */}
        <button
          onClick={() => onChangeView('settings')}
          className={`flex flex-col items-center justify-center min-touch-target px-2.5 py-1 rounded-full transition-all ${
            activeView === 'settings'
              ? 'text-amber-400 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
          }`}
        >
          <HardDrive className={`w-5 h-5 transition-transform ${activeView === 'settings' ? 'scale-110 text-amber-400' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">Vault</span>
          {activeView === 'settings' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-gold-glow" />
          )}
        </button>
      </div>
    </nav>
  );
};
