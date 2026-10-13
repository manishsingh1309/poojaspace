import React from 'react';
import {
  HardDrive,
  ExternalLink,
  Smartphone,
  LogOut,
  LogIn,
  Moon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useDrive } from '../../context/DriveContext';
import { POOJA_HERO_IMAGE } from '../../assets/personalPhotos';

export const SettingsView: React.FC = () => {
  const { isAuthenticated, userProfile, signIn, signOut, isConfigured } = useAuth();
  const { accountQuota } = useDrive();

  const formatGb = (bytes: number) => {
    if (!bytes) return '15 GB';
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const totalLimit = accountQuota?.limit || 16106127360;
  const totalUsage = accountQuota?.usage || 0;
  const freeBytes = Math.max(0, totalLimit - totalUsage);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-8">
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Vault &amp; Account</span>
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
        </h2>
        <p className="text-xs text-zinc-400">
          Personal storage settings and Google Drive connection
        </p>
      </div>

      {/* Account Connection Card */}
      <div className="luxury-glass-card p-5 rounded-3xl border border-zinc-800/80 shadow-xl space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              src={userProfile?.picture || POOJA_HERO_IMAGE}
              alt="Pooja"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-gold-glow-sm"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#09090E] ${
                isAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-white truncate">
              {isAuthenticated ? (userProfile?.name || 'Pooja Didi') : 'Pooja Didi'}
            </h3>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {isAuthenticated ? userProfile?.email : 'Google Drive not connected yet'}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAuthenticated ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-[11px] font-semibold text-zinc-300">
                {isAuthenticated ? 'Google Drive Active' : 'Offline / Preview Mode'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800/80">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full text-rose-400 hover:text-rose-300 border-rose-500/30"
              icon={<LogOut className="w-4 h-4" />}
            >
              Disconnect Google Drive
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={signIn}
              className="w-full gold-button font-bold"
              icon={<LogIn className="w-4 h-4 text-black" />}
            >
              {isConfigured ? 'Connect Google Drive' : 'Connect Google Account'}
            </Button>
          )}
        </div>
      </div>

      {/* Appearance Status - Pure Obsidian Dark Mode */}
      <div className="luxury-glass-card p-5 rounded-3xl border border-zinc-800/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Moon className="w-4.5 h-4.5 text-amber-300 fill-amber-300/20" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Display Appearance</h3>
              <p className="text-[11px] text-zinc-400">Obsidian Void &amp; Gold • OLED Dark Mode</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/15 text-amber-400 border border-amber-400/30 shadow-gold-glow-sm">
            Dark Mode Active
          </span>
        </div>
      </div>

      {/* Storage Information Card */}
      <div className="luxury-glass-card p-5 rounded-3xl border border-zinc-800/80 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Google Account Capacity</h3>
            <p className="text-[11px] text-zinc-400">
              {formatGb(freeBytes)} free of {formatGb(totalLimit)} pool
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Photos and videos uploaded to Poojaspace go directly into your personal Google Drive in high resolution.
        </p>

        <a
          href="https://one.google.com/storage"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors pt-1"
        >
          <span>Open Google One storage dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Install on Oppo Phone Guide */}
      <div className="luxury-glass-card p-5 rounded-3xl border border-zinc-800/80 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Install on Oppo Phone</h3>
            <p className="text-[11px] text-zinc-400">Add icon to home screen in 30 seconds</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5 p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0">
              1
            </span>
            <span>Open in Chrome on your Oppo phone</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0">
              2
            </span>
            <span>Tap Chrome menu (three dots ⋮ at top right)</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0">
              3
            </span>
            <span>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></span>
          </div>
        </div>

        <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-[11px] flex items-center gap-2 mt-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Opens full-screen just like a native app without address bar!</span>
        </div>
      </div>
    </div>
  );
};
