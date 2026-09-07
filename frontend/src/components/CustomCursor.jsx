import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export const CustomCursor = () => {
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth springs for trailing outer ring
  const springX = useSpring(cursorX, { stiffness: 450, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 450, damping: 28 });

  useEffect(() => {
    // Disable on touch devices or reduced motion
    if (window.matchMedia('(pointer: coarse)').matches || 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    const checkHover = (e) => {
      const target = e.target;
      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', checkHover);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', checkHover);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, visible]);

  if (isTouchDevice || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Outer Spring Ring */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovered ? 40 : 26,
          height: isHovered ? 40 : 26,
          borderColor: isHovered ? 'rgba(0, 240, 255, 0.7)' : 'rgba(0, 240, 255, 0.35)',
          backgroundColor: isHovered ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 240, 255, 0)',
        }}
        transition={{ duration: 0.15 }}
        className="rounded-full border border-accent-cyan/40 pointer-events-none"
      />

      {/* Center Precise Dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovered ? 1.4 : 1,
          backgroundColor: isHovered ? '#00F0FF' : '#38BDF8',
        }}
        transition={{ duration: 0.1 }}
        className="w-1.5 h-1.5 rounded-full pointer-events-none shadow-[0_0_8px_rgba(0,240,255,0.8)]"
      />
    </div>
  );
};

export default CustomCursor;
