import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';

export default function CategoryCard({
  category,
  onClick
}) {
  const Icon = category.icon;
  const clampedPct = Math.min(Math.max(category.percentage || 0, 0), 100);

  return (
    <GlassCard
      interactive
      onClick={() => onClick && onClick(category)}
      className="group flex flex-col justify-between p-5"
    >
      {/* Top ambient glow */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ background: category.color }}
      />

      <div className="flex items-start justify-between gap-3">
        {/* 3D-style elevated icon badge */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/15 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          style={{
            background: `linear-gradient(135deg, ${category.color}28, rgba(16, 24, 43, 0.9))`,
            boxShadow: `0 8px 20px -4px ${category.color}35, inset 0 1px 1px rgba(255,255,255,0.25)`
          }}
        >
          <Icon className="w-6 h-6" style={{ color: category.color }} />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] group-hover:text-[#22D3EE] transition-colors">
          <span>{category.count} {category.count === 1 ? 'txn' : 'txns'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-heading font-semibold text-[#F8FAFC]">
            {category.name}
          </h3>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${category.color}18`,
              color: category.color
            }}
          >
            {category.percentage}%
          </span>
        </div>

        <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">
          {category.description}
        </p>

        <div className="mt-3 text-xl font-heading font-bold text-[#F8FAFC]">
          <AnimatedCounter value={category.amount} />
        </div>

        {/* Category progress bar */}
        <div className="mt-3 w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              backgroundColor: category.color,
              boxShadow: `0 0 10px ${category.color}80`
            }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
