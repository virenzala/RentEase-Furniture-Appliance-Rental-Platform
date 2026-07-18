'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../services/api';
import { 
  KeyRound, 
  Mail, 
  ArrowRight, 
  ShieldAlert, 
  Loader2,
  Sparkles,
  UserCheck,
  X,
  CheckCircle2
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  // Credentials form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // App utilities
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Forgot Password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setIsClient(true);
    // If user already logged in, push to homepage or redirect
    const user = authService.getCurrentUser();
    if (user) {
      router.push(redirect ? `/${redirect}` : '/');
    }
  }, []);

  if (!isClient) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await authService.login(email, password);
      // Success redirect
      window.location.href = redirect ? `/${redirect}` : '/';
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Invalid email or password combinations.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setResetMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    setResetLoading(true);
    try {
      await authService.forgotPassword(resetEmail, newPassword);
      setResetMessage({ type: 'success', text: 'Password reset successfully!' });
      // clear inputs
      setResetEmail('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto close modal after 2.5 seconds
      setTimeout(() => {
        setShowForgotModal(false);
        setResetMessage({ type: '', text: '' });
      }, 2500);
    } catch (err) {
      console.error('Password reset error:', err);
      setResetMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to reset password.' 
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Ultra-slick Quick Fill controls for testing out the three roles
  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@rentease.com');
      setPassword('admin123');
    } else if (role === 'vendor') {
      setEmail('vendor@rentease.com');
      setPassword('vendor123');
    } else {
      setEmail('user@rentease.com');
      setPassword('user123');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-xl flex flex-col gap-6 mt-10">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white">Sign In to RentEase</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 font-light">
          Unlock premium furniture and appliance leasing instantly.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
        {/* Email Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
            <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-0 focus:outline-none w-full text-xs font-semibold placeholder-slate-400"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center mb-0.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password</label>
            <button 
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setResetMessage({ type: '', text: '' });
              }}
              className="text-[10px] font-bold text-teal-600 hover:text-teal-500 transition-colors focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
            <KeyRound className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-0 focus:outline-none w-full text-xs font-semibold placeholder-slate-400"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-2 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-teal-600/35 hover-lift transition-all text-sm disabled:bg-slate-400"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying credentials...
            </>
          ) : (
            <>
              Access Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* QUICK FILL DEMO ACCOUNTS PANEL (SUPER HELPFUL!) */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/20 rounded-2xl flex flex-col gap-3">
        <h4 className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Quick Test Profiles
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => handleQuickFill('user')}
            className="py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-teal-600 transition-colors"
          >
            Customer
          </button>
          <button 
            onClick={() => handleQuickFill('vendor')}
            className="py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-teal-600 transition-colors"
          >
            Vendor
          </button>
          <button 
            onClick={() => handleQuickFill('admin')}
            className="py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-teal-600 transition-colors"
          >
            Platform Admin
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        New to RentEase?{' '}
        <Link href="/register" className="font-bold text-teal-600 hover:text-teal-500">
          Create Account
        </Link>
      </p>

      {/* ==================== FORGOT PASSWORD MODAL ==================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-outfit font-extrabold text-xl text-slate-900 dark:text-white">Reset Password</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 font-light">
                Enter your email address and choose a new password.
              </p>
            </div>

            {/* Notification Messages */}
            {resetMessage.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 border text-xs font-semibold ${
                resetMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/10 dark:border-emerald-800/30 dark:text-emerald-400'
                  : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/10 dark:border-red-800/30 dark:text-red-400'
              }`}>
                {resetMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                )}
                <span>{resetMessage.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
              
              {/* Reset Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="bg-transparent border-0 focus:outline-none w-full text-xs font-semibold placeholder-slate-400"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">New Password</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
                  <KeyRound className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-transparent border-0 focus:outline-none w-full text-xs font-semibold placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Confirm New Password</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
                  <KeyRound className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-transparent border-0 focus:outline-none w-full text-xs font-semibold placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-4 mt-2 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-teal-600/35 hover-lift transition-all text-sm disabled:bg-slate-400"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-sm text-slate-500 font-semibold">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
