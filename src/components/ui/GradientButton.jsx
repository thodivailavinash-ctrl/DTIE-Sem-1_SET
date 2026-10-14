import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from './GlassCard';

export default function GradientButton({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const variants = {
    primary:
      'bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-[#070B18] font-semibold shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_28px_rgba(139,92,246,0.45)] border border-white/20',
    secondary:
      'bg-[#10182B]/80 hover:bg-[#10182B] text-[#F8FAFC] border border-white/10 hover:border-[#22D3EE]/50 shadow-sm',
    danger:
      'bg-[#FB7185]/15 hover:bg-[#FB7185]/25 text-[#FB7185] border border-[#FB7185]/30',
    success:
      'bg-[#34D399]/15 hover:bg-[#34D399]/25 text-[#34D399] border border-[#34D399]/30',
    ghost:
      'bg-transparent hover:bg-white/5 text-[#94A3B8] hover:text-[#F8FAFC]'
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-base rounded-xl'
  };

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.015 }}
      whileTap={disabled || loading ? {} : { scale: 0.985 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
