'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../services/api';
import { 
  User, 
  Mail, 
  KeyRound, 
  Phone, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertTriangle 
} from 'lucide-react';

export default function Register() {
  const router = useRouter();

  // Registration Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // App Utilities
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const user = authService.getCurrentUser();
    if (user) {
      router.push('/');
    }
  }, []);

  if (!isClient) return null;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please enter all required fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await authService.register({
        name,
        email,
        password,
        phone,
        address,
        role: 'user' // Default to user
      });
      // Redirect to homepage
      window.location.href = '/';
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMsg(err.response?.data?.message || 'Error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-xl flex flex-col gap-6 mt-10">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6" />
        </div>
        <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white">Create RentEase Account</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 font-light">
          Join thousands of smart dwellers unlocking high-quality rental appliances.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Name *</label>
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
            <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-0 focus:outline-none w-full text-xs font-semibold placeholder-slate-400"
              required
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address *</label>
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
            <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input 
              type="email" 
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-0 focus:outline-none w-full text-xs font-semibold placeholder-slate-400"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Secure Password *</label>
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

        {/* Contact Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone Number</label>
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
            <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-transparent border-0 focus:outline-none w-full text-xs font-semibold placeholder-slate-400"
            />
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Default Address</label>
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
            <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Apartment, Street Address, City..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-transparent border-0 focus:outline-none w-full text-xs font-semibold placeholder-slate-400"
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
              Creating Profile...
            </>
          ) : (
            <>
              Register Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-teal-600 hover:text-teal-500">
          Sign In
        </Link>
      </p>
    </div>
  );
}
