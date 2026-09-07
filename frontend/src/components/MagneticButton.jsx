import React, { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const MagneticButton = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled = false,
  as = 'button',
  ...props
}) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (disabled || shouldReduceMotion || isTouch || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.22;
    const y = (clientY - (top + height / 2)) * 0.22;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const baseStyles = "relative inline-flex items-center justify-center font-display font-semibold text-xs tracking-wider uppercase rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

  const variants = {
    primary: "bg-gradient-to-r from-accent-cyan to-accent-violet text-space-dark shadow-lg shadow-accent-cyan/20 hover:shadow-accent-cyan/40 px-6 py-3",
    secondary: "bg-space-card/90 hover:bg-space-card text-white border border-white/15 hover:border-accent-cyan/50 px-6 py-3",
    outline: "border border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10 px-5 py-2.5",
    accent: "bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-emerald text-space-dark font-bold shadow-xl px-6 py-3",
    ghost: "text-slate-300 hover:text-white hover:bg-white/5 px-4 py-2",
  };

  const Component = as === 'div' ? motion.div : motion.button;

  return (
    <Component
      ref={ref}
      type={as === 'button' ? type : undefined}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.4 }}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default MagneticButton;
