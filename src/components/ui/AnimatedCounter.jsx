import React, { useEffect, useState, useRef } from 'react';
import { formatINR } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';

export default function AnimatedCounter({
  value = 0,
  isCurrency = true,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 700,
  className = ''
}) {
  const { settings } = useFinance();
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (settings?.reducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = Number(prevValueRef.current) || 0;
    const endValue = Number(value) || 0;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    let animationFrame;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, settings?.reducedMotion]);

  const formatted = isCurrency
    ? formatINR(Math.round(displayValue))
    : `${prefix}${Number(displayValue).toFixed(decimals)}${suffix}`;

  return <span className={className}>{formatted}</span>;
}
