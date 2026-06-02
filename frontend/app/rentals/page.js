'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { rentalService } from '../../services/api';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Wrench, 
  PlusCircle, 
  RotateCcw, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';

export default function MyRentals() {
  const router = useRouter();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [extendingId, setExtendingId] = useState(null);
  const [extraMonths, setExtraMonths] = useState(3);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadMyRentals() {
    setLoading(true);
    try {
      const data = await rentalService.getMyRentals();
      setRentals(data);
    } catch (err) {
      console.error('Error fetching rentals:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyRentals();
  }, []);

  const handleExtendLease = async (rentalId) => {
    setActionLoading(true);
    try {
      await rentalService.extend(rentalId, extraMonths);
      alert('Lease extension processed successfully!');
      setExtendingId(null);
      loadMyRentals();
    } catch (err) {
      console.error('Extend failed:', err);
      alert(err.response?.data?.message || 'Error processing extension');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnItem = async (rentalId) => {
    if (!window.confirm('Are you sure you want to schedule a return pickup? This will terminate your lease and initiate security deposit returns.')) {
      return;
    }
    setActionLoading(true);
    try {
      await rentalService.returnItem(rentalId);
      alert('Return pickup scheduled successfully. Our operations crew will contact you shortly.');
      loadMyRentals();
    } catch (err) {
      console.error('Return failed:', err);
      alert(err.response?.data?.message || 'Error scheduling return');
    } finally {
      setActionLoading(false);
    }
  };

  const getDaysRemaining = (endDateStr) => {
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getLeaseProgress = (startDateStr, endDateStr) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const today = new Date();
    const total = end - start;
    const elapsed = today - start;
    if (total <= 0) return 100;
    const percentage = Math.round((elapsed / total) * 100);
    return percentage > 100 ? 100 : percentage < 0 ? 0 : percentage;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-10 animate-pulse mt-4">
        <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 shimmer-card rounded" />
        <div className="flex flex-col gap-6">
          {[1, 2].map((idx) => (
            <div key={idx} className="h-44 bg-slate-100 dark:bg-slate-800 shimmer-card rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  const activeLeases = rentals.filter((r) => r.status === 'active' || r.status === 'pending');
  const returnedLeases = rentals.filter((r) => r.status === 'completed');

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">My Active Leases</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Monitor remaining days on your lease, request extensions, or log return pickups.
        </p>
      </div>

      {/* Main rentals section */}
      {rentals.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-[2.5rem] shadow-sm max-w-lg mx-auto mt-10">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-outfit font-extrabold text-xl text-slate-800 dark:text-white mb-2">No Active Leases</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-light">
            You don&apos;t have any items under lease at the moment. Outfit your home with design-forward products starting at low monthly rents.
          </p>
          <Link
            href="/products"
            className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold shadow-md hover-lift transition-all text-sm flex items-center gap-1.5"
          >
            Outfit My Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* 1. ACTIVE LEASES */}
          {activeLeases.length > 0 && (
            <div className="flex flex-col gap-6">
              <h3 className="font-outfit font-extrabold text-lg text-slate-800 dark:text-white border-l-4 border-teal-600 pl-3">
                Current Leases ({activeLeases.length})
              </h3>
              
              <div className="flex flex-col gap-6">
                {activeLeases.map((rental) => {
                  const daysLeft = getDaysRemaining(rental.endDate);
                  const progress = getLeaseProgress(rental.startDate, rental.endDate);
                  const formattedEnd = new Date(rental.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <div 
                      key={rental._id}
                      className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6"
                    >
                      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                        {/* Left Side Info */}
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-15 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                            <img src={rental.product.images && rental.product.images[0]} alt={rental.product.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="px-2.5 py-0.5 rounded-md text-[9px] font-extrabold bg-teal-50 dark:bg-teal-950/40 text-teal-600 uppercase tracking-wider">
                              {rental.product.category}
                            </span>
                            <h4 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mt-1 leading-tight">
                              {rental.product.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {rental.product.city} &bull; Delivery: #RE-{rental._id.slice(0,5).toUpperCase()}
                            </p>
                          </div>
                        </div>

                        {/* Mid Financial details */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm shrink-0">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Monthly Rent</p>
                            <p className="font-extrabold text-teal-600 dark:text-teal-400 text-lg">${rental.product.monthlyRent}/mo</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Refunded Deposit</p>
                            <p className="font-extrabold text-slate-700 dark:text-slate-300 text-lg">${rental.depositAmount}</p>
                          </div>
                        </div>
                      </div>

                      {/* LEASE TIMELINE PROGRESS BAR */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1 text-teal-600">
                            <Clock className="w-4 h-4" />
                            {daysLeft} days remaining ({rental.tenure} mo lease)
                          </span>
                          <span>End Date: {formattedEnd}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-slate-700/50" />

                      {/* LEASE ACTIONS DRAWER */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                          {/* Trigger Extend Form */}
                          <button
                            onClick={() => setExtendingId(extendingId === rental._id ? null : rental._id)}
                            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <PlusCircle className="w-4 h-4 text-teal-400" />
                            Extend Lease
                          </button>

                          {/* Trigger Return pickup */}
                          <button
                            onClick={() => handleReturnItem(rental._id)}
                            disabled={actionLoading}
                            className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Schedule Return
                          </button>

                          {/* Request Repair maintenance */}
                          <Link
                            href={`/maintenance?productId=${rental.productId}&rentalId=${rental._id}`}
                            className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <Wrench className="w-4 h-4 text-teal-600" />
                            Request Repair
                          </Link>
                        </div>

                        {/* Interactive Extension Controller Panel */}
                        {extendingId === rental._id && (
                          <div className="w-full sm:w-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4 animate-in slide-in-from-right duration-200">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Add Months</label>
                              <select
                                value={extraMonths}
                                onChange={(e) => setExtraMonths(Number(e.target.value))}
                                className="py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                              >
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                              </select>
                            </div>

                            <button
                              onClick={() => handleExtendLease(rental._id)}
                              disabled={actionLoading}
                              className="px-4 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 shrink-0"
                            >
                              Extend Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. RETURNED / COMPLETED LEASES */}
          {returnedLeases.length > 0 && (
            <div className="flex flex-col gap-6">
              <h3 className="font-outfit font-extrabold text-lg text-slate-800 dark:text-white border-l-4 border-slate-400 pl-3">
                Returned Products ({returnedLeases.length})
              </h3>
              
              <div className="flex flex-col gap-4">
                {returnedLeases.map((rental) => (
                  <div 
                    key={rental._id}
                    className="bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-3xl flex items-center justify-between opacity-80"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        <img src={rental.product.images && rental.product.images[0]} alt={rental.product.title} className="w-full h-full object-cover grayscale" />
                      </div>
                      <div>
                        <h4 className="font-outfit font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {rental.product.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          Status: Returned &bull; Refund: Complete
                        </p>
                      </div>
                    </div>
                    
                    <span className="px-3.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Lease Terminated
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
