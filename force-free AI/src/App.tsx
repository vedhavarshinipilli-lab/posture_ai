import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoginScreen } from './components/LoginScreen';
import { SetupScreen } from './components/SetupScreen';
import { LiveWorkoutScreen } from './components/LiveWorkoutScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { AccountPortalScreen } from './components/AccountPortalScreen';
import { DoctorDashboardScreen } from './components/DoctorDashboardScreen';
import { UserDashboardScreen } from './components/UserDashboardScreen';

type Screen =
  | 'LOGIN'
  | 'AUTH_PORTAL'
  | 'DOCTOR_DASHBOARD'
  | 'USER_DASHBOARD'
  | 'SETUP'
  | 'WORKOUT'
  | 'RESULTS'
  | 'LIBRARY';

type Role = 'doctor' | 'user';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LOGIN');
  const [portalSource, setPortalSource] = useState<'LOGIN' | 'SETUP'>('LOGIN');
  const [authEmail, setAuthEmail] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('Squat');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(12);
  const [finalReps, setFinalReps] = useState(0);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const openAccountPortal = (from: 'LOGIN' | 'SETUP') => {
    setPortalSource(from);
    navigateTo('AUTH_PORTAL');
  };

  const handleAuthSuccess = (email: string, role: Role) => {
    setAuthEmail(email);
    navigateTo(role === 'doctor' ? 'DOCTOR_DASHBOARD' : 'USER_DASHBOARD');
  };

  const handleSignOut = () => {
    setAuthEmail('');
    navigateTo('LOGIN');
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
            <LoginScreen
              onStart={() => navigateTo('SETUP')}
              onAccountPortal={() => openAccountPortal('LOGIN')}
            />
          </motion.div>
        )}

        {currentScreen === 'AUTH_PORTAL' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35 }}
          >
            <AccountPortalScreen
              onBack={() => navigateTo(portalSource)}
              onLoginSuccess={handleAuthSuccess}
            />
          </motion.div>
        )}

        {currentScreen === 'DOCTOR_DASHBOARD' && (
          <motion.div
            key="doc-dash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <DoctorDashboardScreen
              email={authEmail}
              onContinue={() => navigateTo('SETUP')}
              onSignOut={handleSignOut}
            />
          </motion.div>
        )}

        {currentScreen === 'USER_DASHBOARD' && (
          <motion.div
            key="user-dash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <UserDashboardScreen
              email={authEmail}
              onContinue={() => navigateTo('SETUP')}
              onSignOut={handleSignOut}
            />
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
              onAccountPortal={() => openAccountPortal('SETUP')}
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
