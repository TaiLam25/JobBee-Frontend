import React from 'react';

export type AdminBadgeVariant = 
  | 'verified' 
  | 'pending' 
  | 'rejected' 
  | 'unverified' 
  | 'approved' 
  | 'hidden' 
  | 'locked' 
  | 'active'
  | 'user_reported'
  | 'system_auto'
  | 'admin'
  | 'employer'
  | 'candidate'
  | 'full_time'
  | 'small_job'
  | 'neutral';

interface AdminBadgeProps {
  variant?: AdminBadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  dot = false,
}) => {
  const variantStyles: Record<AdminBadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
    verified: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60', dotColor: 'bg-emerald-400' },
    approved: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60', dotColor: 'bg-emerald-400' },
    active: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60', dotColor: 'bg-emerald-400' },
    
    pending: { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-800/60', dotColor: 'bg-amber-400' },
    
    rejected: { bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-800/60', dotColor: 'bg-rose-400' },
    locked: { bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-800/60', dotColor: 'bg-rose-400' },
    
    hidden: { bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-800', dotColor: 'bg-slate-500' },
    unverified: { bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-800', dotColor: 'bg-slate-500' },
    neutral: { bg: 'bg-slate-900/80', text: 'text-slate-300', border: 'border-slate-800', dotColor: 'bg-slate-400' },
    
    system_auto: { bg: 'bg-cyan-950/70', text: 'text-cyan-300', border: 'border-cyan-800/70', dotColor: 'bg-cyan-400' },
    user_reported: { bg: 'bg-indigo-950/70', text: 'text-indigo-300', border: 'border-indigo-800/70', dotColor: 'bg-indigo-400' },
    
    admin: { bg: 'bg-purple-950/70', text: 'text-purple-300', border: 'border-purple-800/70', dotColor: 'bg-purple-400' },
    employer: { bg: 'bg-blue-950/70', text: 'text-blue-300', border: 'border-blue-800/70', dotColor: 'bg-blue-400' },
    candidate: { bg: 'bg-slate-800', text: 'text-slate-200', border: 'border-slate-700', dotColor: 'bg-slate-400' },
    
    full_time: { bg: 'bg-indigo-950/60', text: 'text-indigo-300', border: 'border-indigo-800/60', dotColor: 'bg-indigo-400' },
    small_job: { bg: 'bg-sky-950/60', text: 'text-sky-300', border: 'border-sky-800/60', dotColor: 'bg-sky-400' },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${style.dotColor}`} />}
      {children}
    </span>
  );
};
