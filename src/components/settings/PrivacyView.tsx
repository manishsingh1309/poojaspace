import React from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Smartphone,
  RotateCcw,
  Key,
} from 'lucide-react';

export const PrivacyView: React.FC = () => {
  const principles = [
    {
      icon: Lock,
      title: 'Files belong to your Google account',
      desc: 'All photos, videos, and documents you upload are stored directly in your own Google Drive. They are yours forever, even if this website is closed or removed.',
      color: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
    },
    {
      icon: EyeOff,
      title: 'No middleman server or storage',
      desc: 'Files stream straight from your browser/phone to Google Drive. Neither the developer, nor any server or third-party service ever receives or stores copies of your private photos.',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      icon: Key,
      title: 'Least-privilege permissions',
      desc: 'Poojaspace only requests the narrow "drive.file" scope. It can only see and manage files that were created by or uploaded to Poojaspace. It cannot see your Gmail, Docs, or private Drive files.',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      icon: Smartphone,
      title: 'Never deletes phone originals',
      desc: 'Uploading to Poojaspace will never automatically remove or erase photos from your phone gallery or local storage. Your original photos stay exactly where they are.',
      color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
    {
      icon: RotateCcw,
      title: 'Gentle recovery & no sudden loss',
      desc: 'If you delete an item in Poojaspace, it moves to Recently Deleted first so you can restore it with a single tap. Permanent deletion requires two deliberate confirmations.',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      icon: ShieldCheck,
      title: 'Revoke access anytime',
      desc: 'You can disconnect your Google account inside Poojaspace with one tap, or revoke access in your Google Account Security dashboard anytime.',
      color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-xs font-semibold mb-2 border border-gold-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
          <span>Private by Design</span>
        </div>
        <h2 className="text-lg font-bold text-obsidian-text-primary tracking-tight">Privacy &amp; Security</h2>
        <p className="text-xs text-obsidian-text-muted">
          Plain-language commitments for Pooja didi and family privacy.
        </p>
      </div>

      <div className="space-y-3">
        {principles.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="p-4 bg-obsidian-card rounded-3xl border border-obsidian-border hover:border-gold-500/30 transition-colors shadow-soft-sm flex items-start gap-3.5"
            >
              <div
                className={`w-10 h-10 rounded-2xl ${item.color} border flex items-center justify-center shrink-0 shadow-xs mt-0.5`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-obsidian-text-primary">{item.title}</h3>
                <p className="text-xs text-obsidian-text-secondary mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-obsidian-surface rounded-2xl border border-obsidian-border text-center text-xs text-obsidian-text-muted">
        Google OAuth access tokens are stored in browser memory only and never saved to localStorage or external analytics.
      </div>
    </div>
  );
};
