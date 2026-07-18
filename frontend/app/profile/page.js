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
  AlertCircle,
  FileText,
  UserCheck,
  Camera
} from 'lucide-react';

const PRESETS = [
  { name: 'Sofia', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Alex', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Emily', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Marcus', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Zoe', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' }
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  
  // Interaction State
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [customAvatarToggle, setCustomAvatarToggle] = useState(false);

  async function fetchProfile() {
    setLoading(true);
    try {
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
      setAvatar(data.avatar || '');
      setBio(data.bio || '');
      setGender(data.gender || '');
      
      // Format DOB (YYYY-MM-DD) for date input
      if (data.dob) {
        setDob(data.dob.substring(0, 10));
      } else {
        setDob('');
      }
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
      const updated = await authService.updateProfile({ 
        name, 
        phone, 
        address, 
        avatar,
        bio,
        gender,
        dob
      });
      setProfile(updated);
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
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
      setAvatar(profile.avatar || '');
      setBio(profile.bio || '');
      setGender(profile.gender || '');
      if (profile.dob) {
        setDob(profile.dob.substring(0, 10));
      } else {
        setDob('');
      }
    }
    setEditMode(false);
    setCustomAvatarToggle(false);
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

      {/* Notifications */}
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

      {/* Profile Card */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-xl shadow-slate-100/50 dark:shadow-none">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-teal-500 to-indigo-600 relative">
          <div className="absolute -bottom-12 left-8">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-24 h-24 rounded-3xl object-cover shadow-lg border-4 border-white dark:border-slate-800"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-400 to-indigo-500 text-white font-bold flex items-center justify-center text-4xl shadow-lg border-4 border-white dark:border-slate-800">
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="pt-16 pb-8 px-8">
          
          {/* Header row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-6 mb-6">
            <div className="max-w-[70%]">
              <h2 className="font-outfit font-bold text-2xl text-slate-800 dark:text-white truncate">
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
            /* ==================== EDIT MODE FORM ==================== */
            <form onSubmit={handleUpdate} className="space-y-6">
              
              {/* Avatar Picker Section */}
              <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Camera className="w-5 h-5 text-teal-600" />
                  <span className="font-bold text-sm">Choose Profile Picture</span>
                </div>
                
                {/* Preset Circles */}
                <div className="flex flex-wrap items-center gap-4">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setAvatar(p.url);
                        setCustomAvatarToggle(false);
                      }}
                      className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                        avatar === p.url 
                          ? 'border-teal-500 ring-2 ring-teal-500/30' 
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  
                  {/* Custom Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setCustomAvatarToggle(!customAvatarToggle)}
                    className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                      customAvatarToggle 
                        ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/20 dark:border-teal-850 dark:text-teal-400' 
                        : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Custom URL
                  </button>
                </div>

                {/* Custom Input Toggle */}
                {customAvatarToggle && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-teal-500 transition-colors text-slate-800 dark:text-white text-xs"
                      placeholder="Paste image URL here (https://...)"
                    />
                  </div>
                )}
              </div>

              {/* Basic Fields */}
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

                <div>
                  <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-teal-500 transition-colors text-slate-800 dark:text-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-teal-500 transition-colors text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
                  Bio / About Me
                </label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-teal-500 transition-colors text-slate-800 dark:text-white resize-none"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
                  Shipping / Delivery Address
                </label>
                <textarea
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-teal-500 transition-colors text-slate-800 dark:text-white resize-none"
                  placeholder="Enter shipping address"
                />
              </div>

              {/* Action Buttons */}
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
            /* ==================== VIEW DETAILS MODE ==================== */
            <div className="space-y-6">
              
              {/* Bio block */}
              {profile.bio && (
                <div className="flex items-start gap-3 p-5 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30 rounded-3xl">
                  <FileText className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                      Bio / About Me
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                      "{profile.bio}"
                    </p>
                  </div>
                </div>
              )}

              {/* Main Fields Grid */}
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

                {/* Gender */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-teal-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                      Gender
                    </h4>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold mt-1">
                      {profile.gender || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-teal-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                      Date of Birth
                    </h4>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold mt-1">
                      {profile.dob 
                        ? new Date(profile.dob).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Account Type */}
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
                <div className="flex items-start gap-3 col-span-1 md:col-span-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-teal-600">
                    <UserCheck className="w-5 h-5" />
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
