import React from 'react';
import { motion } from 'motion/react';

export const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ${className}`}
  >
    {children}
  </motion.div>
);

export const NeonButton = ({ 
  children, 
  onClick, 
  variant = "primary",
  className = "" 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: "primary" | "secondary" | "danger",
  className?: string
}) => {
  const variants = {
    primary: "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]",
    secondary: "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8)]",
    danger: "bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] hover:shadow-[0_0_30px_rgba(225,29,72,0.8)]"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-8 py-4 rounded-xl font-bold tracking-wide transition-all duration-300 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};
