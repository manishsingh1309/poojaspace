import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'rose' | 'sage' | 'amber' | 'plum' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
  icon,
}) => {
  const variantStyles = {
    gold: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
    rose: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
    sage: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    plum: 'bg-zinc-800/90 text-zinc-300 border-zinc-700/60',
    neutral: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1 font-medium tracking-tight',
    md: 'text-xs px-3 py-1 gap-1.5 font-semibold tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shrink-0 transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
