'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { maintenanceService, rentalService, authService } from '../../services/api';
import { 
  Wrench, 
  AlertCircle, 
  Clock, 
  UserCheck, 
  CheckCircle, 
  MapPin, 
  HelpCircle,
  Inbox,
  PlusCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const preSelectedRental = searchParams.get('rentalId') || '';

  // Core States
  const [tickets, setTickets] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Form Fields
  const [selectedRental, setSelectedRental] = useState(preSelectedRental);
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState('medium');

  async function loadData() {
    setLoading(true);
    try {
      const ticketData = await maintenanceService.getMyTickets();
      setTickets(ticketData);

      const rentalData = await rentalService.getMyRentals();
      const activeLeases = rentalData.filter(r => r.status === 'active' || r.status === 'pending');
      setRentals(activeLeases);

      // Pre-select first active lease if none selected
      if (!selectedRental && activeLeases.length > 0) {
        setSelectedRental(activeLeases[0]._id);
      }
    } catch (err) {
      console.error('Error loading maintenance data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cachedUser = authService.getCurrentUser();
    setUser(cachedUser);
    if (cachedUser) {
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!selectedRental) {
      alert('Please choose an item under active lease');
      return;
    }
    if (!issue) {
      alert('Please describe the repair issue');
      return;
    }

    setFormLoading(true);
    try {
      await maintenanceService.create({
        rentalId: selectedRental,
        issue,
        priority
      });
      alert('Maintenance repair request submitted successfully. We have scheduled an upkeep operator.');
      setIssue('');
      loadData();
    } catch (err) {
      console.error('Create ticket failed:', err);
      alert(err.response?.data?.message || 'Error filing repair ticket');
    } finally {
      setFormLoading(false);
    }
  };

  const getPriorityColor = (prio) => {
    if (prio === 'high') return 'bg-red-50 text-red-600 border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/30';
    if (prio === 'medium') return 'bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/30';
    return 'bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/30';
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-10 animate-pulse mt-4">
        <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 shimmer-card rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 h-96 bg-slate-100 dark:bg-slate-800 shimmer-card rounded-[2.5rem]" />
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="h-44 bg-slate-100 dark:bg-slate-800 shimmer-card rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">Maintenance Support Portal</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Submit free maintenance claims on rented items and monitor technician assignment status in real-time.
        </p>
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-[2.5rem] shadow-sm max-w-lg mx-auto mt-10">
          <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 mb-4">
            <Wrench className="w-8 h-8" />
          </div>
          <h3 className="font-outfit font-extrabold text-xl text-slate-800 dark:text-white mb-2">Sign In for Maintenance Support</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-light">
            Sign in to submit repair tickets, schedule technician visits, or track ticket progress for your leased items.
          </p>
          <a
            href="/login?redirect=/maintenance"
            className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold shadow-md hover-lift transition-all text-sm flex items-center gap-1.5"
          >
            Sign In to Account
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT COLUMN: Submit Repair Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm">
          <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <PlusCircle className="w-5 h-5 text-teal-600" />
            File Upkeep Request
          </h3>

          {rentals.length === 0 ? (
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl text-center flex flex-col gap-4 items-center">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                You must have an active lease (sofa, washer, smart TV) to file maintenance claims.
              </p>
              <a href="/products" className="text-xs font-bold text-teal-600 hover:text-teal-500">
                Explore Catalog &rarr;
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="flex flex-col gap-5">
              {/* Active Lease Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Rented Item</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-1">
                  <Wrench className="w-4 h-4 text-slate-400 mr-2" />
                  <select
                    value={selectedRental}
                    onChange={(e) => setSelectedRental(e.target.value)}
                    className="bg-transparent border-0 focus:outline-none w-full text-xs font-bold text-slate-700 dark:text-slate-300 py-3.5 cursor-pointer"
                  >
                    {rentals.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.product.title} (#{r._id.slice(0,5).toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority levels */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Issue Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setPriority(prio)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        priority === prio
                          ? prio === 'high'
                            ? 'bg-red-600 border-red-600 text-white shadow-md'
                            : prio === 'medium'
                            ? 'bg-amber-600 border-amber-600 text-white shadow-md'
                            : 'bg-teal-600 border-teal-600 text-white shadow-md'
                          : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                      }`}
                    >
                      {prio.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Describe the Issue</label>
                <textarea 
                  placeholder="Provide precise details: brand signs, noise descriptions, structural issues..."
                  rows="4"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold w-full focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-4 mt-2 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-teal-600/35 hover-lift transition-all text-sm disabled:bg-slate-400"
              >
                Submit Repair Ticket
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: Active Upkeeps & Real-time Timelines */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h3 className="font-outfit font-extrabold text-lg text-slate-800 dark:text-white border-l-4 border-teal-600 pl-3 mb-2">
            Active Tickets ({tickets.length})
          </h3>

          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-[2.5rem] shadow-sm">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-4">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="font-outfit font-bold text-base text-slate-800 dark:text-white">No Logged Claims</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
                All systems functional. If an appliance triggers warnings, submit claims for 24-hour maintenance dispatch.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {tickets.map((ticket) => (
                <div 
                  key={ticket._id}
                  className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-[2.5rem] shadow-sm flex flex-col gap-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={ticket.productImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-outfit font-bold text-slate-800 dark:text-white leading-tight">
                          {ticket.productTitle}
                        </h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          ID: #TCK-{ticket._id.slice(0,5).toUpperCase()} &bull; Logged: {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold border uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority} Prio
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                    <span className="font-bold text-slate-800 dark:text-slate-100">Issue:</span> {ticket.issue}
                  </p>

                  <div className="h-px bg-slate-100 dark:bg-slate-700" />

                  {/* REAL-TIME HIGH-FIDELITY TIMELINE STATE MACHINE */}
                  <div className="flex justify-between items-center px-4">
                    {/* Stage 1: Pending */}
                    <div className="flex flex-col items-center gap-1.5 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                        ticket.status === 'pending'
                          ? 'bg-amber-600 text-white animate-pulse shadow-amber-600/35 ring-4 ring-amber-100 dark:ring-amber-950/40'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {ticket.status !== 'pending' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Logged</span>
                    </div>

                    <div className={`flex-grow h-1 mx-2 rounded-full ${
                      ticket.status !== 'pending' ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`} />

                    {/* Stage 2: Assigned */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                        ticket.status === 'assigned'
                          ? 'bg-amber-600 text-white animate-pulse shadow-amber-600/35 ring-4 ring-amber-100 dark:ring-amber-950/40'
                          : ticket.status === 'resolved'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>
                        {ticket.status === 'resolved' ? <CheckCircle className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Assigned</span>
                    </div>

                    <div className={`flex-grow h-1 mx-2 rounded-full ${
                      ticket.status === 'resolved' ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`} />

                    {/* Stage 3: Resolved */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/40 shadow-emerald-600/35'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Resolved</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  );
}

export default function Maintenance() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-sm text-slate-500 font-semibold">Loading Portal...</div>}>
      <MaintenanceContent />
    </Suspense>
  );
}
