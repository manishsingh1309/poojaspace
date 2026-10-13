import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';

interface WelcomeWaveGuideProps {
  onConnectDrive: () => void;
  onExplore: () => void;
}

export const WelcomeWaveGuide: React.FC<WelcomeWaveGuideProps> = ({
  onConnectDrive,
  onExplore,
}) => {
  const { isAuthenticated, userProfile } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss or allow manual close
  useEffect(() => {
    const dismissed = sessionStorage.getItem('poojaspace_welcome_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('poojaspace_welcome_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 border border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-[#18181E] to-[#121216] shadow-xl animate-fade-in">
      {/* Background ambient solar glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          {/* Animated Waving Hand or Celebration Icon */}
          <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            {isAuthenticated ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <span className="text-2xl animate-wave" role="img" aria-label="Waving hand">
                👋
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>
                {isAuthenticated
                  ? `Welcome, ${userProfile?.name?.split(' ')[0] || 'Pooja didi'}!`
                  : 'Namaste Pooja didi!'}
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed max-w-md">
              {isAuthenticated
                ? 'Your Google Drive vault is active. Uploaded photos and clips stay safe in your own storage forever.'
                : 'Your private memories sanctuary is ready. Connect your Google account with one tap to begin.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={onConnectDrive}
                    className="gold-button text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-gold-glow active:scale-95"
                  >
                    <span>Connect Google Drive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onExplore}
                    className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
                  >
                    Take a look first
                  </button>
                </>
              ) : (
                <button
                  onClick={onExplore}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <span>Explore your library</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg transition-colors shrink-0"
          title="Dismiss guide"
          aria-label="Dismiss guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
