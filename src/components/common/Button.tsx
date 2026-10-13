import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 rounded-2xl select-none active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none min-touch-target focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-2 gap-1.5 min-h-[38px]',
    md: 'text-sm px-4.5 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[50px] shadow-obsidian',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black hover:from-amber-300 hover:to-amber-500 shadow-gold-glow active:shadow-none font-bold',
    secondary:
      'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 shadow-sm',
    outline:
      'border border-zinc-700 text-zinc-200 bg-transparent hover:bg-zinc-900 hover:border-amber-400 hover:text-amber-400',
    ghost:
      'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80',
    danger:
      'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-700 text-white font-black border-2 border-red-500 shadow-lg shadow-red-950/80',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
