import React from 'react';
import { motion } from 'motion/react';
import { GlassCard, NeonButton } from './UI';
import { Trophy, Share2, RotateCcw, ArrowRight } from 'lucide-react';

export const ResultsScreen = ({ 
  reps, 
  onRestart, 
  onLibrary 
}: { 
  reps: number, 
  onRestart: () => void, 
  onLibrary: () => void 
}) => {
  const score = Math.min(100, Math.floor((reps / 12) * 100));

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
      <div className="max-w-xl w-full">
        <GlassCard className="p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-400" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Trophy className="w-12 h-12 text-cyan-400" />
          </motion.div>

          <h2 className="text-4xl font-black mb-2">SESSION COMPLETE</h2>
          <p className="text-slate-400 uppercase tracking-widest text-xs mb-12">Performance Analytics Ready</p>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Total Reps</p>
              <p className="text-5xl font-black text-white">{reps}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Form Score</p>
              <div className="relative w-16 h-16 mx-auto">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <motion.circle 
                    cx="32" cy="32" r="28" 
                    fill="transparent" 
                    stroke="#a855f7" 
                    strokeWidth="4" 
                    strokeDasharray="175.9"
                    initial={{ strokeDashoffset: 175.9 }}
                    animate={{ strokeDashoffset: 175.9 * (1 - score/100) }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{score}%</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-6 mb-12 border border-white/5 text-left">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">AI Feedback</h4>
            <ul className="space-y-3">
              {[
                'Excellent depth on sets 2 and 3',
                'Maintain consistent tempo during descent',
                'Core stability remained optimal'
              ].map((f, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <NeonButton onClick={onLibrary} className="flex items-center justify-center gap-2">
              EXPLORE LIBRARY <ArrowRight className="w-5 h-5" />
            </NeonButton>
            <div className="flex gap-4">
              <button 
                onClick={onRestart}
                className="flex-1 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" /> RESTART
              </button>
              <button className="flex-1 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors font-bold flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" /> SHARE
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
