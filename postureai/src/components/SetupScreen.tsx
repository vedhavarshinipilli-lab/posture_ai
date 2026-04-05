import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GlassCard, NeonButton } from './UI';
import { ChevronLeft, Plus, Minus, Activity, UserCircle2 } from 'lucide-react';

export const SetupScreen = ({ 
  onBack, 
  onStart,
  onAccountPortal,
}: { 
  onBack: () => void, 
  onStart: (exercise: string, sets: number, reps: number) => void,
  onAccountPortal?: () => void,
}) => {
  const [exercise, setExercise] = useState('Squat');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(12);

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-white">
      <header className="max-w-4xl mx-auto mb-12 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold font-headline tracking-tight">Setup <span className="text-cyan-400">Session</span></h2>
        {onAccountPortal ? (
          <button
            type="button"
            onClick={onAccountPortal}
            title="Account"
            className="p-2 rounded-full bg-slate-800 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-colors"
          >
            <UserCircle2 className="w-6 h-6 text-cyan-400/90" />
          </button>
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10" />
        )}
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <h3 className="text-xl font-bold text-slate-300">Select Exercise</h3>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { 
                name: 'Squat', 
                video: 'https://www.youtube.com/embed/lsRAK6cr5kY?autoplay=1&mute=1&loop=1&playlist=lsRAK6cr5kY',
                color: 'cyan' 
              },
              { 
                name: 'Push-up', 
                video: 'https://www.youtube.com/embed/0LaoF369azs?autoplay=1&mute=1&loop=1&playlist=0LaoF369azs',
                color: 'purple' 
              }
            ].map((ex) => (
              <motion.div
                key={ex.name}
                whileHover={{ y: -5 }}
                onClick={() => setExercise(ex.name)}
                className={`relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                  exercise === ex.name ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'border-white/5 grayscale hover:grayscale-0'
                }`}
              >
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={ex.video}
                  title={ex.name}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                  className="w-full h-full pointer-events-none scale-150"
                ></iframe>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-lg font-bold">{ex.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">AI Analysis Ready</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <GlassCard className="p-8 sticky top-24">
            <h3 className="text-lg font-bold mb-8">Session Details</h3>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-xs uppercase tracking-widest text-slate-400 font-bold">
                  <span>Number of Sets</span>
                  <span className="text-cyan-400">{sets.toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/50 rounded-xl p-2 border border-white/5">
                  <button onClick={() => setSets(Math.max(1, sets - 1))} className="p-3 hover:bg-white/5 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="text-xl font-bold">{sets}</span>
                  <button onClick={() => setSets(sets + 1)} className="p-3 hover:bg-white/5 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs uppercase tracking-widest text-slate-400 font-bold">
                  <span>Target Reps</span>
                  <span className="text-purple-400">{reps.toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/50 rounded-xl p-2 border border-white/5">
                  <button onClick={() => setReps(Math.max(1, reps - 1))} className="p-3 hover:bg-white/5 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="text-xl font-bold">{reps}</span>
                  <button onClick={() => setReps(reps + 1)} className="p-3 hover:bg-white/5 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex gap-3 items-center">
                <Activity className="w-5 h-5 text-cyan-400" />
                <p className="text-xs text-slate-300">Biometric tracking will initialize upon session start.</p>
              </div>

              <NeonButton 
                className="w-full" 
                onClick={() => onStart(exercise, sets, reps)}
              >
                START SESSION
              </NeonButton>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};
