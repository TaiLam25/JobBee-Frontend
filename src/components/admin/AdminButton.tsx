import React from 'react';

export type AdminButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
export type AdminButtonSize = 'xs' | 'sm' | 'md';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  variant = 'primary',
  size = 'sm',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles: Record<AdminButtonSize, string> = {
    xs: 'px-2.5 py-1 text-xs gap-1.5 rounded',
    sm: 'px-3 py-1.5 text-xs font-medium gap-2 rounded-md',
    md: 'px-4 py-2 text-sm font-medium gap-2 rounded-md',
  };

  const variantStyles: Record<AdminButtonVariant, string> = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30 shadow-xs shadow-indigo-950/50',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600',
    danger: 'bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 hover:border-rose-700',
    success: 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 hover:border-emerald-700',
    ghost: 'bg-transparent hover:bg-slate-800/70 text-slate-300 hover:text-slate-100',
    outline: 'bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
