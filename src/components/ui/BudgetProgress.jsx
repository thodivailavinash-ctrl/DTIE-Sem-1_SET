import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

/**
 * Animated circular progress indicator for Budget Usage.
 * Color logic per spec:
 * - Below 80%: Green/cyan (#22D3EE / #34D399)
 * - 80–100%: Amber (#FBBF24)
 * - Above 100%: Coral/red (#FB7185)
 * Allows numerical percentage to exceed 100%, while visual ring caps at 100%.
 */
export default function BudgetProgress({
  percentage = 0,
  size = 220,
  strokeWidth = 16,
  subLabel = 'of monthly budget used'
}) {
  const numericPct = Number.isFinite(Number(percentage)) ? Number(percentage) : 0;
  const clampedVisualPct = Math.min(Math.max(numericPct, 0), 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedVisualPct / 100) * circumference;

  let strokeColor = '#22D3EE';
  let statusBadge = { text: 'Healthy Pace', color: 'text-[#34D399] bg-[#34D399]/10 border-[#34D399]/30' };

  if (numericPct > 100) {
    strokeColor = '#FB7185';
    statusBadge = { text: 'Overspent Alert', color: 'text-[#FB7185] bg-[#FB7185]/15 border-[#FB7185]/40' };
  } else if (numericPct >= 80) {
    strokeColor = '#FBBF24';
    statusBadge = { text: 'Near Limit', color: 'text-[#FBBF24] bg-[#FBBF24]/15 border-[#FBBF24]/40' };
  }

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="budgetGradientCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(148, 163, 184, 0.14)"
            strokeWidth={strokeWidth}
          />
          {/* Animated foreground progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={numericPct < 80 ? 'url(#budgetGradientCyan)' : strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 10px ${strokeColor}55)`
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="text-3xl font-heading font-bold tracking-tight text-[#F8FAFC]">
            <AnimatedCounter
              value={numericPct}
              isCurrency={false}
              decimals={numericPct % 1 === 0 ? 0 : 1}
              suffix="%"
            />
          </div>
          <span className="text-xs text-[#94A3B8] mt-1">{subLabel}</span>
          <span
            className={`mt-2 px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${statusBadge.color}`}
          >
            {statusBadge.text}
          </span>
        </div>
      </div>
    </div>
  );
}
