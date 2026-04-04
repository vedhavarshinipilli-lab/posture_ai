import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoginScreen } from './components/LoginScreen';
import { SetupScreen } from './components/SetupScreen';
import { LiveWorkoutScreen } from './components/LiveWorkoutScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { LibraryScreen } from './components/LibraryScreen';

type Screen = 'LOGIN' | 'SETUP' | 'WORKOUT' | 'RESULTS' | 'LIBRARY';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LOGIN');
  const [selectedExercise, setSelectedExercise] = useState('Squat');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(12);
  const [finalReps, setFinalReps] = useState(0);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleStartWorkout = (exercise: string, sets: number, reps: number) => {
    setSelectedExercise(exercise);
    setSets(sets);
    setReps(reps);
    navigateTo('WORKOUT');
  };

  const handleEndWorkout = (count: number) => {
    setFinalReps(count);
    navigateTo('RESULTS');
  };

  return (
    <div className="bg-slate-950 min-h-screen font-sans selection:bg-cyan-500/30">
      <AnimatePresence mode="wait">
        {currentScreen === 'LOGIN' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginScreen onStart={() => navigateTo('SETUP')} />
          </motion.div>
        )}

        {currentScreen === 'SETUP' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <SetupScreen 
              onBack={() => navigateTo('LOGIN')} 
              onStart={handleStartWorkout} 
            />
          </motion.div>
        )}

        {currentScreen === 'WORKOUT' && (
          <motion.div
            key="workout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LiveWorkoutScreen 
              exercise={selectedExercise} 
              targetReps={reps} 
              onEnd={handleEndWorkout} 
            />
          </motion.div>
        )}

        {currentScreen === 'RESULTS' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <ResultsScreen 
              reps={finalReps} 
              onRestart={() => navigateTo('SETUP')} 
              onLibrary={() => navigateTo('LIBRARY')} 
            />
          </motion.div>
        )}

        {currentScreen === 'LIBRARY' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <LibraryScreen onBack={() => navigateTo('RESULTS')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
