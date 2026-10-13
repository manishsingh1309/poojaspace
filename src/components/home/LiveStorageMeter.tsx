import React, { useState } from 'react';
import { useDrive } from '../../context/DriveContext';
import { useAuth } from '../../context/AuthContext';
import { HardDrive, Image as ImageIcon, Video, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

export const LiveStorageMeter: React.FC = () => {
  const { stats, accountQuota, refreshFiles } = useDrive();
  const { isAuthenticated } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Real or mock quota (dynamically calculated)
  const totalLimit = accountQuota?.limit || 16106127360; // 15 GB default Google quota
  const totalUsage = accountQuota?.usage || stats.totalBytes || 0;
  const freeBytes = Math.max(0, totalLimit - totalUsage);
  const percentUsed = Math.min(100, Math.max(1, Math.round((totalUsage / totalLimit) * 100)));

  // Proportional percentages for visual meter
  const photoPercent = Math.max(
    1,
    Math.min(80, (stats.photoBytes / (totalLimit || 1)) * 100)
  );
  const videoPercent = Math.max(
    0.5,
    Math.min(80, (stats.videoBytes / (totalLimit || 1)) * 100)
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFiles();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <div className="luxury-glass-card rounded-3xl p-4 sm:p-6 border border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-4">
      {/* Ambient background illumination */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 shadow-gold-glow">
            <HardDrive className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Google Drive Storage
              </h3>
              {isAuthenticated ? (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Quota
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded-full">
                  Preview
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {formatBytes(totalUsage)} used •{' '}
              <strong className="text-white font-semibold">
                {formatBytes(freeBytes)} Free
              </strong>{' '}
              of {formatBytes(totalLimit)}
            </p>
          </div>
        </div>

        {/* 1-Tap Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh storage quota"
          className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80 rounded-xl transition-all active:scale-95 shrink-0"
          title="Refresh storage"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
          />
        </button>
      </div>

      {/* Gradient Progress Capsule */}
      <div className="relative z-10 space-y-2">
        <div className="w-full h-3.5 bg-zinc-900/90 rounded-full overflow-hidden flex p-0.5 border border-zinc-800/80 shadow-inner">
          {/* Photos Segment (Coral Amber Gradient) */}
          <div
            style={{ width: `${Math.min(85, photoPercent + 1.5)}%` }}
            className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-amber-500 rounded-l-full transition-all duration-700 shadow-sm"
            title="Photos storage"
          />
          {/* Videos Segment (Ultraviolet Gradient) */}
          <div
            style={{ width: `${Math.min(85, videoPercent + 1)}%` }}
            className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 transition-all duration-700"
            title="Videos storage"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            {percentUsed}% Drive used
          </span>
          <span className="text-amber-400 font-bold">
            {formatBytes(freeBytes)} Available
          </span>
        </div>
      </div>

      {/* 3 Metric Cards: Photos, Videos, Free Space */}
      <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 pt-1">
        {/* Photos Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/60 text-center hover:border-amber-400/40 transition-colors">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-400 mb-1">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-white block">
            {stats.photoCount} items
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">
            {formatBytes(stats.photoBytes)}
          </span>
        </div>

        {/* Videos Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/60 text-center hover:border-purple-400/40 transition-colors">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-purple-400 mb-1">
            <Video className="w-3.5 h-3.5" />
            <span>Videos</span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-white block">
            {stats.videoCount} items
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">
            {formatBytes(stats.videoBytes)}
          </span>
        </div>

        {/* Free Space Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/60 text-center hover:border-emerald-400/40 transition-colors">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Space</span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-white block">
            {formatBytes(freeBytes)}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">
            {Math.max(0, 100 - percentUsed)}% free
          </span>
        </div>
      </div>

      {/* Safety & Peace of Mind Reassurance */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Phone storage safe • 0 cloud charges</span>
        </span>
        <span className="text-zinc-500 font-mono text-[10px]">
          {isAuthenticated ? 'Connected to Drive' : 'Sync ready'}
        </span>
      </div>
    </div>
  );
};
