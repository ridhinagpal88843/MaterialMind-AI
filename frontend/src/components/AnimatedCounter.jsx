import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

export const AnimatedCounter = ({
  target,
  duration = 1.8,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView || target === undefined || target === null) return;

    let start = 0;
    const end = parseFloat(target);
    if (isNaN(end)) return;

    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = start + (end - start) * easeProgress;

      setCurrent(val);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCurrent(end);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [isInView, target, duration]);

  const formattedValue = current.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
