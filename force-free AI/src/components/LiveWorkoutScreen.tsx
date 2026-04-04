import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneOff, Camera, Pause, Play, Activity, Info } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export const LiveWorkoutScreen = ({ 
  exercise, 
  targetReps, 
  onEnd 
}: { 
  exercise: string, 
  targetReps: number, 
  onEnd: (finalReps: number) => void 
}) => {
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoUrl = exercise === 'Squat' 
    ? "https://www.youtube.com/embed/lsRAK6cr5kY?autoplay=1&mute=1&loop=1&playlist=lsRAK6cr5kY"
    : "https://www.youtube.com/embed/0LaoF369azs?autoplay=1&mute=1&loop=1&playlist=0LaoF369azs";

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/stats`);
        if (!res.ok) return;
        const data: { reps?: number; stage?: string; feedback?: string } = await res.json();
        if (typeof data.reps === 'number') setReps(data.reps);
        if (typeof data.stage === 'string') setStage(data.stage);
        if (typeof data.feedback === 'string') setFeedback(data.feedback);
      } catch {
        /* network / CORS — keep last values */
      }
    };

    void fetchStats();
    const statsInterval = setInterval(() => {
      void fetchStats();
    }, 1000);

    return () => clearInterval(statsInterval);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onEnd(reps);
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative font-sans">
      {/* Main Video Feed Placeholder */}
      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
        <div className="relative w-full h-full">
          <img
            src={`${API_BASE}/video_feed`}
            alt="Live workout"
            style={{ width: '100%', borderRadius: '12px' }}
          />
        </div>
      </div>

      {/* Top Left: Reps Card */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-8 left-8 z-20"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl min-w-[160px] shadow-2xl">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Reps</p>
          <div className="flex items-baseline gap-2">
            <motion.span 
              key={reps}
              initial={{ scale: 1.2, color: '#22d3ee' }}
              animate={{ scale: 1, color: '#fff' }}
              className="text-6xl font-black"
            >
              {reps}
            </motion.span>
            <span className="text-slate-500 font-bold">/ {targetReps}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${!isPaused ? 'animate-pulse' : ''} ${stage.toUpperCase() === 'DOWN' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
            <span className="text-xs font-bold tracking-tighter uppercase">{stage}</span>
          </div>
        </div>
      </motion.div>

      {/* Top Center: Mode */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-cyan-500/20 border border-cyan-500/30 px-6 py-2 rounded-full backdrop-blur-md">
          <span className="text-xs font-black tracking-[0.2em] text-cyan-400 uppercase">AI COACH: {exercise}</span>
        </div>
      </div>

      {/* Top Right: Demo Video */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-8 right-8 z-20"
      >
        <div className="w-64 aspect-video rounded-xl overflow-hidden border border-white/20 shadow-2xl relative">
          <iframe 
            width="100%" 
            height="100%" 
            src={videoUrl}
            title="Exercise Demo"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
            className="w-full h-full"
          ></iframe>
          <div className="absolute top-2 left-2 bg-cyan-500 px-2 py-0.5 rounded text-[8px] font-bold pointer-events-none">DEMO</div>
        </div>
        <div className="mt-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-3">
          <div className={`w-2 h-2 bg-red-500 rounded-full ${!isPaused ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-mono font-bold">{formatTime(timer)}</span>
        </div>
      </motion.div>

      {/* Center: Feedback Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={feedback}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.1 }}
            className="text-center"
          >
            <h2 className="text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              {isPaused ? 'PAUSED' : feedback}
            </h2>
            {!isPaused && (
              <div className="mt-4 flex items-center justify-center gap-2 text-cyan-400">
                <Info className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Biometric Alignment Optimal</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Center: Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
        <button className="p-4 bg-slate-800/80 backdrop-blur-md rounded-full border border-white/10 hover:bg-slate-700 transition-colors">
          <Camera className="w-6 h-6" />
        </button>
        
        <button 
          onClick={handleEndSession}
          className="px-10 py-5 bg-rose-600 rounded-xl shadow-[0_0_30px_rgba(225,29,72,0.5)] hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-3"
        >
          <PhoneOff className="w-6 h-6 text-white" />
          <span className="text-sm font-black uppercase tracking-widest text-white">END SESSION</span>
        </button>

        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="p-4 bg-slate-800/80 backdrop-blur-md rounded-full border border-white/10 hover:bg-slate-700 transition-colors"
        >
          {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};
