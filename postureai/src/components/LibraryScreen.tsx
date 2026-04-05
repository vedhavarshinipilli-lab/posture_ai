import React from 'react';
import { motion } from 'motion/react';
import { Search, Play, Clock, Star, ChevronLeft } from 'lucide-react';

const EXERCISES = [
  { id: 1, title: 'Deep Mobility Squats', duration: '12m', level: 'Intermediate', rating: 4.9, video: 'https://www.youtube.com/embed/lsRAK6cr5kY?autoplay=1&mute=1&loop=1&playlist=lsRAK6cr5kY' },
  { id: 2, title: 'Stability Push-ups', duration: '8m', level: 'Beginner', rating: 4.8, video: 'https://www.youtube.com/embed/0LaoF369azs?autoplay=1&mute=1&loop=1&playlist=0LaoF369azs' },
  { id: 3, title: 'Explosive Jumps', duration: '20m', level: 'Advanced', rating: 4.6, video: 'https://www.youtube.com/embed/EY3bzgv2SYo?autoplay=1&mute=1&loop=1&playlist=EY3bzgv2SYo' },
  { id: 4, title: 'Belly Fat Reduction I', duration: '15m', level: 'Beginner', rating: 4.7, video: 'https://www.youtube.com/embed/nB7wdzXYo4Q?autoplay=1&mute=1&loop=1&playlist=nB7wdzXYo4Q' },
  { id: 5, title: 'Belly Fat Reduction II', duration: '18m', level: 'Intermediate', rating: 4.9, video: 'https://www.youtube.com/embed/digpucxFbMo?autoplay=1&mute=1&loop=1&playlist=digpucxFbMo' },
  { id: 6, title: 'Core Stability Plank', duration: '5m', level: 'Beginner', rating: 5.0, video: 'https://www.youtube.com/embed/pSHjTRCQxIw?autoplay=1&mute=1&loop=1&playlist=pSHjTRCQxIw' },
];

export const LibraryScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-black tracking-tight">EXERCISE <span className="text-cyan-400">LIBRARY</span></h2>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10" />
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search exercises, goals, or muscle groups..."
            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-cyan-500 transition-all outline-none"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {EXERCISES.map((ex, i) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="group bg-slate-900/40 rounded-3xl overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all duration-500"
          >
            <div className="aspect-video relative overflow-hidden">
              <iframe 
                width="100%" 
                height="100%" 
                src={ex.video}
                title={ex.title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
                className="w-full h-full pointer-events-none scale-150"
              ></iframe>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold">
                {ex.duration}
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-bold group-hover:text-cyan-400 transition-colors">{ex.title}</h4>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-[10px] font-bold">{ex.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ex.duration}</span>
                <span className="px-2 py-0.5 bg-slate-800 rounded">{ex.level}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </main>
    </div>
  );
};
