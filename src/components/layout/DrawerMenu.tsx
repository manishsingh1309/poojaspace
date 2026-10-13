import React from 'react';
import {
  X,
  Home,
  Image as ImageIcon,
  Video,
  FileText,
  FolderHeart,
  Star,
  Trash2,
  Settings,
  ShieldCheck,
  LogOut,
  LogIn,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ActiveView } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useDrive } from '../../context/DriveContext';
import { POOJA_HERO_IMAGE } from '../../assets/personalPhotos';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
}) => {
  const { isAuthenticated, userProfile, signOut, signIn, isConfigured } = useAuth();
  const { stats, isMockMode } = useDrive();

  if (!isOpen) return null;

  const navLinks: Array<{
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'photos', label: 'Photos', icon: ImageIcon, badge: stats.photoCount },
    { id: 'videos', label: 'Videos', icon: Video, badge: stats.videoCount },
    { id: 'documents', label: 'Documents', icon: FileText, badge: stats.documentCount },
    { id: 'albums', label: 'Albums', icon: FolderHeart, badge: stats.albumCount },
    { id: 'favourites', label: 'Saved Moments', icon: Star },
    { id: 'trash', label: 'Recently Deleted', icon: Trash2, badge: stats.recentlyDeletedCount },
    { id: 'settings', label: 'Storage & Settings', icon: Settings },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
  ];

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleSelect = (view: ActiveView) => {
    onSelectView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#0D0D14] border-l border-zinc-800 shadow-2xl flex flex-col z-10 safe-top safe-bottom">
        {/* Header with profile */}
        <div className="p-5 border-b border-zinc-800/90 bg-gradient-to-br from-[#161724] to-[#0D0D14] relative">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-full min-touch-target flex items-center justify-center transition-colors shadow-sm"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          <div className="flex items-center gap-3 mt-1">
            <div className="relative">
              <img
                src={userProfile?.picture || POOJA_HERO_IMAGE}
                alt="Pooja"
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-gold-glow-sm"
              />
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0D0D14] ${isAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold text-white tracking-tight truncate">
                {isAuthenticated ? (userProfile?.name || 'Pooja Didi') : 'Pooja Didi'}
              </h2>
              <p className="text-xs text-amber-400 font-semibold truncate">
                {isAuthenticated ? (userProfile?.email || 'Google Drive Active') : isMockMode ? 'Demo Preview Mode' : 'Ready to Connect'}
              </p>
            </div>
          </div>

          {/* Quick Storage Overview Pill */}
          <div className="mt-4 p-3 bg-[#161724] rounded-2xl border border-zinc-700/70 flex items-center justify-between text-xs shadow-inner">
            <span className="text-zinc-300 font-medium">Vault Usage:</span>
            <span className="font-extrabold text-amber-400 text-xs sm:text-sm">{formatBytes(stats.totalBytes)}</span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all min-touch-target ${
                  isActive
                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/40 font-bold shadow-sm'
                    : 'text-zinc-200 hover:bg-zinc-900/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 ${
                      isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-amber-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== 0 && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-amber-400/25 text-amber-300 border border-amber-400/30'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* External Google One link */}
          <a
            href="https://one.google.com/storage"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium text-zinc-300 hover:text-amber-400 hover:bg-zinc-900/90 transition-colors min-touch-target"
          >
            <span>Google One Storage</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </div>

        {/* Footer / Account action */}
        <div className="p-4 border-t border-zinc-800/90 bg-[#09090E]">
          {isAuthenticated ? (
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl text-sm font-black bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-700 text-white border-2 border-red-500 shadow-xl shadow-red-950/80 active:scale-[0.98] transition-all min-touch-target"
            >
              <LogOut className="w-5 h-5 text-white stroke-[2.5]" />
              <span className="tracking-wide">Disconnect Google Drive</span>
            </button>
          ) : (
            <button
              onClick={() => {
                signIn();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold gold-button min-touch-target shadow-gold-glow"
            >
              <LogIn className="w-4 h-4 text-black stroke-[2.5]" />
              <span>{isConfigured ? 'Connect Google Drive' : 'Configure Client ID'}</span>
            </button>
          )}

          <div className="mt-3 text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" />
            <span>Built with love for Pooja didi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
