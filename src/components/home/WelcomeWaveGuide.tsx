import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDrive } from '../../context/DriveContext';
import { ArrowRight, CheckCircle2, X, Sparkles, HardDrive } from 'lucide-react';

interface WelcomeWaveGuideProps {
  onConnectDrive: () => void;
  onExplore: () => void;
}

export const WelcomeWaveGuide: React.FC<WelcomeWaveGuideProps> = ({
  onConnectDrive,
  onExplore,
}) => {
  const { isAuthenticated, userProfile } = useAuth();
  const { accountQuota } = useDrive();
  const [isDismissed, setIsDismissed] = useState(false);

  const formatGb = (bytes: number) => {
    if (!bytes) return '15 GB';
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const freeGb = accountQuota?.freeBytes
    ? formatGb(accountQuota.freeBytes)
    : '15 GB';

  // If dismissed, offer a sweet, compact mini-pill so the user can summon it back with 1 tap
  if (isDismissed) {
    if (isAuthenticated) return null;
    return (
      <div className="flex justify-center animate-fade-in my-1">
        <button
          onClick={() => setIsDismissed(false)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 active:scale-95 transition-all shadow-sm"
        >
          <span className="text-sm animate-wave">👋</span>
          <span>Connect Google Drive</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 border border-amber-400/50 bg-gradient-to-br from-amber-500/15 via-[#181924]/90 to-[#101118]/90 shadow-2xl backdrop-blur-xl animate-fade-in">
      {/* Radiant ambient glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          {/* Animated Waving Hand Gesture or Celebration Check */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/15 border border-amber-400/40 flex items-center justify-center shadow-gold-glow">
              {isAuthenticated ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <span className="text-2xl animate-wave" role="img" aria-label="Waving hand">
                  👋
                </span>
              )}
            </div>
            {/* Pulsing beacon badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />
          </div>

          <div className="space-y-1">
            {/* Minimal Header */}
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {isAuthenticated
                  ? `Welcome, ${userProfile?.name?.split(' ')[0] || 'Pooja Didi'}!`
                  : 'Namaste Pooja Didi!'}
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            </div>

            {/* Ultra-minimal text */}
            <p className="text-xs text-zinc-300 leading-relaxed max-w-md">
              {isAuthenticated ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <HardDrive className="w-3.5 h-3.5 shrink-0" />
                  <span>Google Drive connected • {freeGb} free space available</span>
                </span>
              ) : (
                'Connect your Google Drive in 1 tap to save photos & keep phone storage free.'
              )}
            </p>

            {/* Essential Action Button Only */}
            <div className="flex items-center gap-2.5 pt-2">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={onConnectDrive}
                    className="gold-button text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-gold-glow active:scale-95"
                  >
                    <span>Connect Google Drive</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() => {
                      setIsDismissed(true);
                      onExplore();
                    }}
                    className="text-xs font-medium text-zinc-400 hover:text-white px-2.5 py-2 transition-colors"
                  >
                    Explore first
                  </button>
                </>
              ) : (
                <button
                  onClick={onExplore}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <span>View your photos</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-xl transition-colors shrink-0"
          title="Dismiss greeting"
          aria-label="Dismiss greeting"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
