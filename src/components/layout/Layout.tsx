import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { DrawerMenu } from './DrawerMenu';
import { ActiveView } from '../../types/navigation';
import { useUpload } from '../../context/UploadContext';
import { useAuth } from '../../context/AuthContext';
import { Share2, ArrowRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  onOpenQuickAdd: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeView,
  onChangeView,
  onOpenQuickAdd,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pendingShares, setQueueModalOpen, importPendingShares } = useUpload();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Header */}
      <AppHeader
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenQuickAdd={onOpenQuickAdd}
      />

      {/* Pending Share Alert Banner from Android Share Target */}
      {pendingShares.length > 0 && (
        <aside aria-label="Pending shares notification" className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black px-4 py-2.5 shadow-gold-glow animate-fade-in font-semibold">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 shrink-0 animate-bounce stroke-[2.5]" />
              <span>
                <strong>{pendingShares.length} item{pendingShares.length > 1 ? 's' : ''}</strong> shared from Gallery{' '}
                <span className="opacity-90 font-normal">(staged on phone)</span>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAuthenticated ? (
                <button
                  onClick={importPendingShares}
                  className="bg-black text-amber-400 font-bold px-3 py-1 rounded-full text-xs shadow-md hover:bg-zinc-900 active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>Upload now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setQueueModalOpen(true)}
                  className="bg-black/20 hover:bg-black/30 text-black font-semibold px-2.5 py-1 rounded-full text-xs transition-colors"
                >
                  Review
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Main Page Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 pb-36">
        {children}
      </main>

      {/* Bottom Floating Glass Dock */}
      <BottomNav
        activeView={activeView}
        onChangeView={onChangeView}
        onOpenQuickAdd={onOpenQuickAdd}
      />

      {/* Slide-over Drawer Menu */}
      <DrawerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onSelectView={onChangeView}
      />
    </div>
  );
};
