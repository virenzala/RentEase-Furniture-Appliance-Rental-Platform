'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  async function fetchProfile() {
    setLoading(true);
    try {
      // Check if user is logged in
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      const data = await authService.getProfile();
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile details.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const updated = await authService.updateProfile({ name, phone, address });
      setProfile(updated);
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Auto clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    }
    setEditMode(false);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading profile details...</p>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="font-outfit font-extrabold text-4xl bg-gradient-to-r from-slate-900 to-teal-700 dark:from-white dark:to-teal-400 bg-clip-text text-transparent">
          My Account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, credentials, and delivery addresses.
        </p>
      </div>

      {/* Notifications/Feedback */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/10 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400' 
            : 'bg-rose-50/50 border-rose-200/50 dark:bg-rose-950/10 dark:border-rose-800/30 text-rose-700 dark:text-rose-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Premium Profile Glassmorphic Card */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-xl shadow-slate-100/50 dark:shadow-none">
        
        {/* Card Header Profile Banner */}
        <div className="h-32 bg-gradient-to-r from-teal-500 to-indigo-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-400 to-indigo-500 text-white font-bold flex items-center justify-center text-4xl shadow-lg border-4 border-white dark:border-slate-800">
              {initials}
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-6 mb-6">
            <div>
              <h2 className="font-outfit font-bold text-2xl text-slate-800 dark:text-white">
                {profile.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5 mt-0.5 font-medium">
                <Mail className="w-4 h-4 text-slate-400" />
                {profile.email}
              </p>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-sm font-bold shadow-md hover-lift transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            /* Editing Form Mode */
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-teal-500 transition-colors text-slate-800 dark:text-white"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-teal-500 transition-colors text-slate-800 dark:text-white"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
                  Shipping Address
                </label>
                <textarea
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-teal-500 transition-colors text-slate-800 dark:text-white resize-none"
                  placeholder="Enter shipping address"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-bold shadow-md hover-lift transition-all text-sm"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition-all text-sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Details Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-teal-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                      Phone Number
                    </h4>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold mt-1">
                      {profile.phone || 'No phone number provided'}
                    </p>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-teal-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                      Account Type
                    </h4>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold mt-1 capitalize">
                      {profile.role}
                    </p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-teal-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                      Member Since
                    </h4>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold mt-1">
                      {new Date(profile.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-700/50 pt-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-teal-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                    Shipping Address
                  </h4>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold mt-1 whitespace-pre-line leading-relaxed">
                    {profile.address || 'No shipping address configured.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
