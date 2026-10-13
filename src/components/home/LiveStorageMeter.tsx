import React from 'react';
import { useDrive } from '../../context/DriveContext';
import { useAuth } from '../../context/AuthContext';
import { HardDrive, Image as ImageIcon, Video, FileText, CheckCircle2 } from 'lucide-react';

export const LiveStorageMeter: React.FC = () => {
  const { stats, accountQuota, isMockMode } = useDrive();
  const { isAuthenticated } = useAuth();

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Real or mock quota
  const totalLimit = accountQuota?.limit || 16106127360; // 15 GB default
  const totalUsage = accountQuota?.usage || stats.totalBytes || 0;
  const freeBytes = Math.max(0, totalLimit - totalUsage);
  const percentUsed = Math.min(100, Math.max(1, Math.round((totalUsage / totalLimit) * 100)));

  // Calculate proportional percentages for the visual segmented bar
  const photoPercent = Math.max(0.5, (stats.totalBytes ? (stats.photoCount / (stats.fileCount || 1)) * percentUsed : 0.5));
  const videoPercent = Math.max(0.5, (stats.totalBytes ? (stats.videoCount / (stats.fileCount || 1)) * percentUsed : 0.5));

  return (
    <div className="titanium-card p-4 sm:p-5 rounded-3xl border border-[#272733] shadow-lg space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Google Account Storage</span>
              {isAuthenticated && (
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                  Live
                </span>
              )}
            </h3>
            <p className="text-[11px] text-zinc-400">
              {isAuthenticated
                ? `${formatBytes(totalUsage)} used of ${formatBytes(totalLimit)}`
                : isMockMode
                ? `${formatBytes(stats.totalBytes)} used • Connect Google Drive for live quota`
                : 'Connecting to Google Drive...'}
            </p>
          </div>
        </div>

        {/* Free Space Pill */}
        <div className="text-right">
          <span className="text-xs font-bold text-amber-400 block">
            {formatBytes(freeBytes)} Free
          </span>
          <span className="text-[10px] text-zinc-500">Available</span>
        </div>
      </div>

      {/* Segmented Gradient Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-zinc-800/80 rounded-full overflow-hidden flex p-0.5 border border-zinc-700/40">
          {/* Photos Segment (Amber) */}
          <div
            style={{ width: `${Math.min(90, photoPercent + 1)}%` }}
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-l-full transition-all duration-500"
            title="Photos"
          />
          {/* Videos Segment (Purple) */}
          <div
            style={{ width: `${Math.min(90, videoPercent + 1)}%` }}
            className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 transition-all duration-500"
            title="Videos"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 px-0.5">
          <span>{percentUsed}% capacity used</span>
          <span>{formatBytes(totalLimit)} Total Capacity</span>
        </div>
      </div>

      {/* Visual Category Breakdown Badges */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-800/70 text-center">
        <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/50">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-400 mb-0.5">
            <ImageIcon className="w-3 h-3" />
            <span>Photos</span>
          </div>
          <span className="text-xs font-bold text-white block">{stats.photoCount} files</span>
        </div>

        <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/50">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-purple-400 mb-0.5">
            <Video className="w-3 h-3" />
            <span>Videos</span>
          </div>
          <span className="text-xs font-bold text-white block">{stats.videoCount} files</span>
        </div>

        <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/50">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-400 mb-0.5">
            <FileText className="w-3 h-3" />
            <span>Vault</span>
          </div>
          <span className="text-xs font-bold text-white block">{stats.documentCount} docs</span>
        </div>
      </div>

      {/* Reassurance Footer */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
        <span className="flex items-center gap-1 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Zero Monthly Cloud Cost</span>
        </span>
        <span className="text-zinc-500">Stored in Pooja&apos;s Drive</span>
      </div>
    </div>
  );
};
