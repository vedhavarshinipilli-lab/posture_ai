import React from 'react';
import { motion } from 'motion/react';
import { UserRound } from 'lucide-react';
import { GlassCard, NeonButton } from './UI';

export const UserDashboardScreen = ({
  email,
  onContinue,
  onSignOut,
}: {
  email: string;
  onContinue: () => void;
  onSignOut: () => void;
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md"
      >
        <GlassCard className="p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 mb-6">
            <UserRound className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-2">
            User <span className="text-purple-400">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm mb-1">Signed in as</p>
          <p className="text-purple-200/90 font-medium mb-8 truncate">{email}</p>
          <NeonButton className="w-full mb-4" onClick={onContinue} variant="secondary">
            Continue to workout setup
          </NeonButton>
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
          >
            Sign out
          </button>
        </GlassCard>
      </motion.div>
    </div>
  );
};
