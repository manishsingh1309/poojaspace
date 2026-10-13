import React from 'react';
import { Home, Image as ImageIcon, Plus, FolderHeart, FileText } from 'lucide-react';
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
  const leftItems: Array<{
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'photos', label: 'Photos', icon: ImageIcon },
  ];

  const rightItems: Array<{
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'documents', label: 'Docs', icon: FileText },
    { id: 'albums', label: 'Albums', icon: FolderHeart },
  ];

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-40 px-3 pointer-events-none safe-bottom">
      <div className="pointer-events-auto max-w-md mx-auto glass-dock rounded-full px-3 py-1.5 flex items-center justify-between shadow-2xl relative">
        {/* Left items: Home & Photos */}
        <div className="flex items-center gap-1">
          {leftItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex flex-col items-center justify-center min-touch-target px-4 py-1.5 rounded-full transition-all ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'scale-110' : ''
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-gold-glow" />
                )}
              </button>
            );
          })}
        </div>

        {/* Central Sculpted Solar Amber Medallion Button */}
        <div className="relative -top-2 px-1">
          <button
            onClick={onOpenQuickAdd}
            aria-label="Quick Add Photos and Files"
            className="flex items-center justify-center w-13 h-13 rounded-full gold-button border-3 border-[#09090B] shadow-gold-glow active:scale-90 transition-transform focus:outline-none"
          >
            <Plus className="w-6 h-6 stroke-[3] text-black" />
          </button>
        </div>

        {/* Right items: Docs & Albums */}
        <div className="flex items-center gap-1">
          {rightItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex flex-col items-center justify-center min-touch-target px-4 py-1.5 rounded-full transition-all ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'scale-110' : ''
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-gold-glow" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
