import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BrowserRouter,
  useLocation,
  useNavigate,
} from 'react-router-dom';
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

type NavState = { accountReturn?: 'setup' | 'home' } | undefined;

function pathAuthTab(pathname: string): 'login' | 'register' | null {
  if (pathname === '/login') return 'login';
  if (pathname === '/register') return 'register';
  return null;
}

function readInitialScreen(): Screen {
  if (typeof window === 'undefined') return 'LOGIN';
  const p = window.location.pathname;
  if (p === '/login' || p === '/register') return 'AUTH_PORTAL';
  if (p === '/setup') return 'SETUP';
  return 'LOGIN';
}

function readInitialAuthTab(): 'login' | 'register' {
  if (typeof window === 'undefined') return 'login';
  return window.location.pathname === '/register' ? 'register' : 'login';
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentScreen, setCurrentScreen] = useState<Screen>(readInitialScreen);
  const [portalSource, setPortalSource] = useState<'LOGIN' | 'SETUP'>('LOGIN');
  const [authTab, setAuthTab] = useState<'login' | 'register'>(readInitialAuthTab);
  const [authEmail, setAuthEmail] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('Squat');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(12);
  const [finalReps, setFinalReps] = useState(0);

  useEffect(() => {
    const p = location.pathname;
    const tab = pathAuthTab(p);
    const nav = location.state as NavState;

    if (tab) {
      setCurrentScreen('AUTH_PORTAL');
      setAuthTab(tab === 'register' ? 'register' : 'login');
      if (nav?.accountReturn === 'setup') {
        setPortalSource('SETUP');
      } else if (nav?.accountReturn === 'home') {
        setPortalSource('LOGIN');
      }
    } else if (p === '/setup') {
      setCurrentScreen('SETUP');
    }
  }, [location.pathname, location.state]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const openAccountPortal = (from: 'LOGIN' | 'SETUP') => {
    if (from === 'SETUP') {
      navigate('/login', { state: { accountReturn: 'setup' } });
    } else {
      navigate('/login', { state: { accountReturn: 'home' } });
    }
    setPortalSource(from === 'SETUP' ? 'SETUP' : 'LOGIN');
    setAuthTab('login');
    setCurrentScreen('AUTH_PORTAL');
  };

  const handleAuthSuccess = (
    email: string,
    role: Role,
    displayName?: string,
  ) => {
    setAuthEmail(email);
    setAuthDisplayName(displayName?.trim() ?? '');
    setCurrentScreen(role === 'doctor' ? 'DOCTOR_DASHBOARD' : 'USER_DASHBOARD');
    navigate('/', { replace: true, state: {} });
  };

  const handleSignOut = () => {
    setAuthEmail('');
    setAuthDisplayName('');
    navigate('/', { replace: true, state: {} });
    navigateTo('LOGIN');
  };

  const handleStartWorkout = (exercise: string, s: number, r: number) => {
    setSelectedExercise(exercise);
    setSets(s);
    setReps(r);
    navigateTo('WORKOUT');
  };

  const handleEndWorkout = (count: number) => {
    setFinalReps(count);
    navigateTo('RESULTS');
  };

  const handleAuthBack = () => {
    if (portalSource === 'SETUP') {
      navigate('/setup', { replace: true, state: {} });
      setCurrentScreen('SETUP');
    } else {
      navigate('/', { replace: true, state: {} });
      setCurrentScreen('LOGIN');
    }
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
              onStart={() => {
                navigate('/setup', { replace: true, state: {} });
                navigateTo('SETUP');
              }}
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
              initialTab={authTab}
              onBack={handleAuthBack}
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
              displayName={authDisplayName || undefined}
              onContinue={() => {
                navigate('/setup', { replace: true, state: {} });
                navigateTo('SETUP');
              }}
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
              displayName={authDisplayName || undefined}
              onContinue={() => {
                navigate('/setup', { replace: true, state: {} });
                navigateTo('SETUP');
              }}
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
              onBack={() => {
                navigate('/', { replace: true, state: {} });
                navigateTo('LOGIN');
              }}
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
              onRestart={() => {
                navigate('/setup', { replace: true, state: {} });
                navigateTo('SETUP');
              }}
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

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
