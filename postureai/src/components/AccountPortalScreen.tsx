import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { GlassCard, NeonButton } from './UI';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

type Role = 'doctor' | 'user';

export const AccountPortalScreen = ({
  onBack,
  onLoginSuccess,
  initialTab = 'login',
}: {
  onBack: () => void;
  onLoginSuccess: (email: string, role: Role, displayName?: string) => void;
  initialTab?: 'login' | 'register';
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [role, setRole] = useState<Role>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const resetMessage = () => setMessage(null);

  const handleRegister = async () => {
    resetMessage();
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          name: name.trim(),
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
      };
      if (data.success) {
        setMessage({ text: data.message ?? 'Registered successfully', ok: true });
      } else {
        setMessage({
          text: data.message ?? 'Registration failed',
          ok: false,
        });
      }
    } catch {
      setMessage({ text: 'Network error — is the API running on :8000?', ok: false });
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    resetMessage();
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        role?: string;
        name?: string;
      };
      if (data.success && (data.role === 'doctor' || data.role === 'user')) {
        setMessage({ text: data.message ?? 'Welcome back', ok: true });
        const resolvedName =
          (data.name && String(data.name).trim()) || name.trim() || undefined;
        onLoginSuccess(email.trim(), data.role, resolvedName);
        return;
      }
      setMessage({
        text: data.message ?? 'Login failed',
        ok: false,
      });
    } catch {
      setMessage({ text: 'Network error — is the API running on :8000?', ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-white">
      <header className="max-w-lg mx-auto mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold tracking-tight">
          Account <span className="text-cyan-400">Portal</span>
        </h2>
        <div className="w-10" />
      </header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <GlassCard className="p-8">
          <div className="flex rounded-xl bg-slate-950/60 border border-white/10 p-1 mb-8">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  resetMessage();
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${
                  tab === t
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
            Role
          </p>
          <div className="flex gap-3 mb-6">
            {(
              [
                { id: 'user' as Role, label: 'User' },
                { id: 'doctor' as Role, label: 'Doctor' },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setRole(id);
                  resetMessage();
                }}
                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                  role === id
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                    : 'border-white/10 bg-slate-950/40 text-slate-400 hover:border-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
            Full name
          </label>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              resetMessage();
            }}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            placeholder={tab === 'register' ? 'Jane Doe' : 'Optional — matches profile after login'}
          />

          <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              resetMessage();
            }}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            placeholder="you@example.com"
          />

          <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              resetMessage();
            }}
            className="w-full mb-6 px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            placeholder="••••••••"
          />

          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
                message.ok
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {tab === 'login' ? (
            <NeonButton
              className="w-full"
              onClick={() => void handleLogin()}
              variant="primary"
            >
              {busy ? 'Please wait…' : 'Log in'}
            </NeonButton>
          ) : (
            <NeonButton
              className="w-full"
              onClick={() => void handleRegister()}
              variant="secondary"
            >
              {busy ? 'Please wait…' : 'Create account'}
            </NeonButton>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};
