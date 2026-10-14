import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function GlassCard({
  children,
  className = '',
  interactive = false,
  animatedBorder = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        interactive ? 'glass-panel-interactive hover:-translate-y-1' : 'glass-panel',
        animatedBorder && 'animated-glass-border',
        'rounded-2xl p-6 relative overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {/* Subtle top water-like specular reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  );
}
