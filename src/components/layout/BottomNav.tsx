import React from 'react';
import { Home, Image as ImageIcon, Plus, FileText, FolderHeart } from 'lucide-react';
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090E] border-t border-zinc-800 shadow-[0_-12px_36px_rgba(0,0,0,0.95)] transition-colors"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
    >
      <div className="max-w-md mx-auto px-3 pt-2 pb-1 flex items-center justify-between relative">
        {/* 1. Home */}
        <button
          onClick={() => onChangeView('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all min-touch-target ${
            activeView === 'home'
              ? 'text-amber-400 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
          }`}
          aria-label="Home Sanctuary"
        >
          <Home
            className={`w-5 h-5 transition-transform ${
              activeView === 'home' ? 'scale-110 text-amber-400 stroke-[2.5]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-1 font-semibold tracking-tight leading-none">Home</span>
          {activeView === 'home' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-gold-glow" />
          )}
        </button>

        {/* 2. Photos */}
        <button
          onClick={() => onChangeView('photos')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all min-touch-target ${
            activeView === 'photos'
              ? 'text-amber-400 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
          }`}
          aria-label="Photos Gallery"
        >
          <ImageIcon
            className={`w-5 h-5 transition-transform ${
              activeView === 'photos' ? 'scale-110 text-amber-400 stroke-[2.5]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-1 font-semibold tracking-tight leading-none">Photos</span>
          {activeView === 'photos' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-gold-glow" />
          )}
        </button>

        {/* 3. Center Sculpted Gold Upload Button (+) */}
        <div className="flex-1 flex items-center justify-center relative -top-3">
          <button
            onClick={onOpenQuickAdd}
            aria-label="Upload Photos, Videos or Documents"
            className="flex items-center justify-center w-12 h-12 rounded-full gold-button border-4 border-[#09090E] shadow-gold-glow active:scale-90 transition-transform focus:outline-none"
          >
            <Plus className="w-6 h-6 stroke-[3] text-black" />
          </button>
        </div>

        {/* 4. Docs */}
        <button
          onClick={() => onChangeView('documents')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all min-touch-target ${
            activeView === 'documents'
              ? 'text-amber-400 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
          }`}
          aria-label="Documents Vault"
        >
          <FileText
            className={`w-5 h-5 transition-transform ${
              activeView === 'documents' ? 'scale-110 text-amber-400 stroke-[2.5]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-1 font-semibold tracking-tight leading-none">Docs</span>
          {activeView === 'documents' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-gold-glow" />
          )}
        </button>

        {/* 5. Albums */}
        <button
          onClick={() => onChangeView('albums')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all min-touch-target ${
            activeView === 'albums' || activeView === 'album_detail'
              ? 'text-amber-400 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
          }`}
          aria-label="Photo Albums"
        >
          <FolderHeart
            className={`w-5 h-5 transition-transform ${
              activeView === 'albums' || activeView === 'album_detail'
                ? 'scale-110 text-amber-400 stroke-[2.5]'
                : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-1 font-semibold tracking-tight leading-none">Albums</span>
          {(activeView === 'albums' || activeView === 'album_detail') && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-gold-glow" />
          )}
        </button>
      </div>
    </nav>
  );
};
