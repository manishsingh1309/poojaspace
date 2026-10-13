import React from 'react';
import {
  HardDrive,
  Share2,
  ExternalLink,
  Smartphone,
  LogOut,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useDrive } from '../../context/DriveContext';
import { POOJA_HERO_IMAGE } from '../../assets/personalPhotos';

export const SettingsView: React.FC = () => {
  const { isAuthenticated, userProfile, signIn, signOut, isConfigured } = useAuth();
  const { stats, isMockMode } = useDrive();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-obsidian-text-primary tracking-tight">Settings &amp; Storage</h2>
        <p className="text-xs text-obsidian-text-muted">
          Manage your Google connection, storage details, and Oppo phone setup.
        </p>
      </div>

      {/* Account Connection Card */}
      <div className="bg-obsidian-card p-5 rounded-3xl border border-obsidian-border shadow-soft-sm space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={userProfile?.picture || POOJA_HERO_IMAGE}
            alt="Pooja"
            className="w-14 h-14 rounded-full object-cover border-2 border-gold-400 shadow-sm shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-obsidian-text-primary">
              {isAuthenticated ? userProfile?.name : 'Pooja Didi'}
            </h3>
            <p className="text-xs text-obsidian-text-muted truncate mt-0.5">
              {isAuthenticated
                ? userProfile?.email
                : isMockMode
                ? 'Preview Mode (Google Client not configured)'
                : 'Not connected'}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAuthenticated ? 'bg-emerald-400' : 'bg-gold-400'
                }`}
              />
              <span className="text-[11px] font-medium text-obsidian-text-secondary">
                {isAuthenticated
                  ? 'Connected with narrow drive.file scope'
                  : 'Needs Google Drive connection'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-obsidian-border">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full text-rose-400 hover:text-rose-300"
              icon={<LogOut className="w-4 h-4" />}
            >
              Disconnect Google Drive
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={signIn}
              className="w-full"
              icon={<LogIn className="w-4 h-4" />}
            >
              {isConfigured ? 'Connect Google Account' : 'Set up Google Client ID'}
            </Button>
          )}
        </div>
      </div>

      {/* Storage Information Card */}
      <div className="bg-obsidian-card p-5 rounded-3xl border border-obsidian-border shadow-soft-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-obsidian-text-primary">Storage in Google Drive</h3>
            <p className="text-[11px] text-obsidian-text-muted">
              Poojaspace usage vs. Total Google account pool
            </p>
          </div>
        </div>

        <div className="p-3 bg-obsidian-surface rounded-2xl border border-obsidian-border flex items-center justify-between text-xs">
          <span className="font-medium text-obsidian-text-secondary">Poojaspace files:</span>
          <span className="font-bold text-gold-400">{formatBytes(stats.totalBytes)}</span>
        </div>

        <div className="text-xs text-obsidian-text-secondary space-y-2 leading-relaxed">
          <p>
            <strong className="text-obsidian-text-primary">Where does the 20–40 GB come from?</strong>
            <br />
            Poojaspace does not create proprietary cloud quota. Capacity comes from Pooja&apos;s own Google account or from family storage shared by an eligible Google One or Google AI subscription.
          </p>
          <p>
            Files are saved to Pooja&apos;s personal Google Drive under <code className="bg-obsidian-surface px-2 py-0.5 rounded border border-obsidian-border text-gold-400 font-mono text-[11px]">My Drive/Poojaspace</code>.
          </p>
        </div>

        <a
          href="https://one.google.com/storage"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 hover:underline transition-colors"
        >
          <span>Check exact Google account storage &amp; family sharing</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Android Installation Guide Card */}
      <div className="bg-obsidian-card p-5 rounded-3xl border border-obsidian-border shadow-soft-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-obsidian-text-primary">Install on Oppo Phone</h3>
            <p className="text-[11px] text-obsidian-text-muted">
              Add Poojaspace as an app on your Home Screen
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-obsidian-text-secondary">
          <div className="flex items-start gap-2.5 p-2.5 bg-obsidian-surface rounded-xl border border-obsidian-border/50">
            <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 font-bold flex items-center justify-center text-[11px] shrink-0">
              1
            </span>
            <span>Open this site in Chrome on your Oppo phone.</span>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-obsidian-surface rounded-xl border border-obsidian-border/50">
            <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 font-bold flex items-center justify-center text-[11px] shrink-0">
              2
            </span>
            <span>Tap Chrome&apos;s menu (three dots ⋮ at the top right).</span>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-obsidian-surface rounded-xl border border-obsidian-border/50">
            <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 font-bold flex items-center justify-center text-[11px] shrink-0">
              3
            </span>
            <span>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
          </div>
        </div>
      </div>

      {/* Android Gallery Direct Share Guide */}
      <div className="bg-obsidian-card p-5 rounded-3xl border border-obsidian-border shadow-soft-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-obsidian-text-primary">Share from Oppo Gallery</h3>
            <p className="text-[11px] text-obsidian-text-muted">Quickest way to add photos</p>
          </div>
        </div>

        <p className="text-xs text-obsidian-text-secondary leading-relaxed">
          Open your Oppo Gallery or Google Photos app, select photos or videos, tap <strong className="text-obsidian-text-primary">Share</strong>, and choose <strong className="text-gold-400">Poojaspace</strong>!
        </p>

        <div className="p-3 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-2xl text-[11px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>If Gallery sharing is not visible on your model, tap Quick Add in the app!</span>
        </div>
      </div>
    </div>
  );
};
