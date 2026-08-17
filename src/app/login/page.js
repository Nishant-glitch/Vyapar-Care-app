'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { ADMIN_EMAILS } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState('login'); // 'login' | 'forgot_password'
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Forgot password fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Check if already authenticated with active, non-expired session
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vyapar_admin_session');
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.expiresAt && Date.now() < session.expiresAt) {
          const isWhitelisted = ADMIN_EMAILS.some(
            (adm) => adm.toLowerCase() === (session.email || '').toLowerCase()
          );
          if (isWhitelisted) {
            router.push('/dashboard');
          }
        } else {
          localStorage.removeItem('vyapar_admin_session');
        }
      }
    } catch {
      // ignore
    }
  }, [router]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Whitelist Verification Check
    const isWhitelisted = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === cleanEmail);
    if (!isWhitelisted) {
      setErrorMsg('Access Denied: This email address is not authorized for Admin Panel access.');
      setLoading(false);
      return;
    }

    try {
      // 2. Real Supabase Authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        // 3. Establish 24-Hour Secure Session
        const now = Date.now();
        const sessionData = {
          email: data.user.email || cleanEmail,
          role: 'admin',
          userId: data.user.id,
          loginAt: now,
          expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('vyapar_admin_session', JSON.stringify(sessionData));
        }

        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMsg('Authentication service unavailable. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setResetSuccess(false);
    setResetLoading(true);

    const cleanEmail = resetEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter your administrator email address.');
      setResetLoading(false);
      return;
    }

    const isWhitelisted = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === cleanEmail);
    if (!isWhitelisted) {
      setErrorMsg('This email address is not registered as an authorized admin.');
      setResetLoading(false);
      return;
    }

    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMsg(error.message || 'Unable to send password reset email. Please try again.');
      } else {
        setResetSuccess(true);
        setInfoMsg(`Password reset link has been dispatched to ${cleanEmail}. Please check your inbox.`);
      }
    } catch (err) {
      setErrorMsg('Password reset service error. Please try again later.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#F5F5F5]">
      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 transition-all">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1B2B5E] text-[#C5991A] font-black text-2xl shadow-lg shadow-[#1B2B5E]/20 mb-4 border border-[#C5991A]/30">
            V
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">VYAPAR CARE</h1>
          <p className="text-xs font-bold text-[#C5991A] uppercase tracking-widest mt-1">
            CONSULTANCY SERVICES
          </p>
          <div className="inline-block mt-3 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
            🔒 Admin Security Gateway
          </div>
        </div>

        {/* View 1: Standard Clean Sign-In Form */}
        {view === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vyaparcareconsultancy@gmail.com"
                className="admin-input py-2.5 px-3.5 text-sm font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot_password');
                    setErrorMsg('');
                    setInfoMsg('');
                    setResetEmail(email || '');
                  }}
                  className="text-xs font-semibold text-[#1B2B5E] hover:text-[#C5991A] hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="admin-input py-2.5 px-3.5 text-sm font-medium"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-start gap-2">
                <span className="text-sm">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-start gap-2">
                <span className="text-sm">✅</span>
                <span>{infoMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#1B2B5E]/20 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>
        ) : (
          /* View 2: Forgot Password Form */
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-center pb-2">
              <h2 className="text-sm font-bold text-slate-800">Reset Administrator Password</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your whitelisted admin email to receive a secure recovery link.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="vyaparcareconsultancy@gmail.com"
                className="admin-input py-2.5 px-3.5 text-sm font-medium"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-start gap-2">
                <span className="text-sm">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-start gap-2">
                <span className="text-sm">✉️</span>
                <span>{infoMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={resetLoading || resetSuccess}
              className="w-full py-3 px-4 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#1B2B5E]/20 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {resetLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Send Password Reset Link'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="text-xs font-bold text-[#1B2B5E] hover:text-[#C5991A] transition-colors inline-flex items-center gap-1"
              >
                ← Return to Sign In
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-400 font-medium">
        © 2026 Vyapar Care Consultancy Services. All rights reserved.
      </div>
    </div>
  );
}
