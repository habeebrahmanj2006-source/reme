import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function GlassCard({ children, className = '', hoverEffect = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileHover={hoverEffect ? { y: -4, borderColor: 'rgba(168, 85, 247, 0.4)', boxShadow: '0 10px 30px -10px rgba(168, 85, 247, 0.15)' } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`bg-zinc-950/45 backdrop-blur-2xl border border-zinc-800/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-colors duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
