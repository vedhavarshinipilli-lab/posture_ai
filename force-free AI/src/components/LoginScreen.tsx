import React from 'react';
import { motion } from 'motion/react';
import { NeonButton } from './UI';

export const LoginScreen = ({
  onStart,
  onAccountPortal,
}: {
  onStart: () => void;
  onAccountPortal?: () => void;
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center"
      >
        <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 mb-4">
          POSTURE<span className="font-light">AI</span>
        </h1>
        <p className="text-slate-400 tracking-[0.3em] uppercase text-xs mb-12 font-medium">
          Precision Alignment Architecture
        </p>
        
        <NeonButton onClick={onStart}>
          START SESSION
        </NeonButton>

        {onAccountPortal && (
          <button
            type="button"
            onClick={onAccountPortal}
            className="mt-8 text-xs uppercase tracking-[0.25em] text-slate-500 hover:text-cyan-400/90 transition-colors"
          >
            Sign in / Register
          </button>
        )}
      </motion.div>

      <div className="absolute bottom-8 text-slate-600 text-[10px] uppercase tracking-widest">
        v2.4.0 Core Online • Quantum Encrypted
      </div>
    </div>
  );
};
