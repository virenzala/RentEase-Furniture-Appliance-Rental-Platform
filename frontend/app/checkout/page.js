'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../hooks/useCart';
import { rentalService, authService } from '../../services/api';
import { 
  CreditCard, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  Sparkles,
  Receipt
} from 'lucide-react';

export default function Checkout() {
  const router = useRouter();
  const { cartItems, monthlyRentTotal, securityDepositTotal, flatShippingCharge, subtotal, clearCart } = useCart();

  // User checking & initial form loading
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrders, setCreatedOrders] = useState([]);

  // Form Fields
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('morning');

  // Simulated Card Payment Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isCvvFocused, setIsCvvFocused] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login?redirect=checkout');
    } else {
      setUser(currentUser);
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      
      // Default delivery date to 3 days out
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      setDeliveryDate(defaultDate.toISOString().split('T')[0]);
    }
  }, []);

  if (!isClient || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  const handleCardNumberChange = (e) => {
    // Format card number with spaces every 4 digits
    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(v);
    }
  };

  const handleExpiryChange = (e) => {
    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      setCardExpiry(`${v.slice(0, 2)}/${v.slice(2, 4)}`);
    } else {
      setCardExpiry(v);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!address) {
      alert('Please enter a delivery address');
      return;
    }
    if (cardNumber.length < 16 || cardCvv.length < 3) {
      alert('Please fill in complete payment card details');
      return;
    }

    setLoading(true);
    try {
      const items = cartItems.map(item => ({
        productId: item.product._id,
        tenure: item.tenure
      }));
      
      const payload = {
        items,
        deliveryAddress: address,
        deliveryDate: `${deliveryDate}T10:00:00.000Z`
      };

      const res = await rentalService.create(payload);
      setCreatedOrders(res);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Checkout failed:', err);
      alert(err.response?.data?.message || 'Error executing checkout');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>
        
        <div>
          <span className="px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 justify-center mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Lease Confirmed Successfully
          </span>
          <h2 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">Congratulations, {user.name}!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-md font-light leading-relaxed">
            Your premium lease order is registered. Our operations crew is packing your products for delivery and white-glove setup.
          </p>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-700 w-full my-2" />

        {/* ORDER RECEIPT SUMMARY */}
        <div className="w-full text-left bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-700/30 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="font-outfit font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-teal-600" />
            Order Receipt & Delivery details
          </h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm font-medium">
            <p className="text-slate-400">Order ID:</p>
            <p className="text-right text-slate-800 dark:text-slate-200">#RE-{createdOrders[0]?._id?.slice(0,6).toUpperCase()}</p>
            
            <p className="text-slate-400">Scheduled Date:</p>
            <p className="text-right text-slate-800 dark:text-slate-200">
              {new Date(deliveryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} ({deliverySlot === 'morning' ? '9AM - 12PM' : '2PM - 5PM'})
            </p>
            
            <p className="text-slate-400">Items Leased:</p>
            <p className="text-right text-slate-800 dark:text-slate-200">{createdOrders.length} Products</p>

            <p className="text-slate-400">Initial Charge (Paid):</p>
            <p className="text-right text-emerald-600 dark:text-emerald-400 font-extrabold text-base">${subtotal}</p>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
          <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
            &bull; Your security deposit of ${securityDepositTotal} is 100% refundable. Returns can be logged in your portal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
          <Link 
            href="/rentals"
            className="flex-grow py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-lg shadow-teal-600/35 text-sm hover-lift transition-all flex items-center justify-center"
          >
            Track Rentals
          </Link>
          <Link 
            href="/products"
            className="px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm flex items-center justify-center shadow-sm"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Back to Cart navigation */}
      <div>
        <Link 
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Shopping Cart
        </Link>
        <h1 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white mt-4">Secure Checkout</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Complete shipping details and authorize your simulated lease payment.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT COLUMN: Shipping & Scheduled slot details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Shipping details */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-5">
            <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              1. Delivery & Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Leaseholder Name</label>
                <input 
                  type="text" 
                  value={user.name} 
                  disabled
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed w-full focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Contact Number</label>
                <input 
                  type="text" 
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold w-full focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Full Shipping Address</label>
              <textarea 
                placeholder="Street address, Apartment, Suite number, City, State, ZIP..."
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold w-full focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Time Scheduler */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-5">
            <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              2. Delivery Slot Scheduler
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Delivery Date</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                  <input 
                    type="date" 
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="bg-transparent border-0 focus:outline-none text-sm font-semibold w-full cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Preferred Time Window</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-1">
                  <Clock className="w-4 h-4 text-slate-400 mr-2" />
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="bg-transparent border-0 focus:outline-none w-full text-sm font-semibold text-slate-700 dark:text-slate-300 py-3 cursor-pointer"
                  >
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (2 PM - 5 PM)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Holographic Simulated Payment Card and Pricing summary */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
          {/* HOLOGRAPHIC SIMULATED CREDIT CARD */}
          <div className="relative w-full aspect-[1.58/1] overflow-hidden rounded-[2rem] bg-gradient-to-tr from-slate-950 via-slate-800 to-indigo-950 text-white p-6 shadow-2xl border border-white/10 flex flex-col justify-between select-none">
            {/* Hologram Overlay Sheet */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Back View (CVV focused) */}
            {isCvvFocused ? (
              <div className="h-full flex flex-col justify-between py-2">
                {/* Black signature stripe */}
                <div className="h-10 bg-slate-950 -mx-6 mb-2" />
                <div className="flex items-center justify-between">
                  <div className="bg-slate-300 text-slate-800 font-mono text-right py-1 px-4 text-sm font-bold flex-grow mr-4 skew-x-3">
                    {cardCvv ? cardCvv : '•••'}
                  </div>
                  <div className="text-slate-500 font-extrabold text-[8px] uppercase tracking-wider">
                    Authorized signature
                  </div>
                </div>
                <div className="text-[7px] text-slate-500 leading-tight">
                  This card is simulated for RentEase platform verification. Returns, extensions, and monthly bills do not pull actual credit data.
                </div>
              </div>
            ) : (
              /* Front View */
              <div className="h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-10 bg-slate-800/80 rounded-lg flex items-center justify-center border border-slate-700/50">
                    <div className="w-8 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-md shadow-md" />
                  </div>
                  <CreditCard className="w-8 h-8 text-white/40" />
                </div>

                <div className="flex flex-col gap-1 my-2">
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest">Card Number</span>
                  <span className="font-mono text-lg md:text-xl font-bold tracking-widest text-slate-100 drop-shadow">
                    {cardNumber ? cardNumber : '•••• •••• •••• ••••'}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 font-mono text-[8px] uppercase tracking-wider">Cardholder</span>
                    <span className="font-outfit text-xs font-extrabold uppercase tracking-wide truncate max-w-[150px]">
                      {cardName ? cardName : 'FULL NAME'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-slate-400 font-mono text-[8px] uppercase tracking-wider">Expiry</span>
                    <span className="font-mono text-xs font-bold">
                      {cardExpiry ? cardExpiry : 'MM/YY'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CARD PAYMENT INPUTS FORM */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <h4 className="font-outfit font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-teal-600" />
              3. Simulated Payment card
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cardholder Name</label>
              <input 
                type="text" 
                placeholder="SARAH JENKINS"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold w-full focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Card Number</label>
              <input 
                type="text" 
                placeholder="1111 2222 3333 4444"
                maxLength="19"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold w-full focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Expiry (MM/YY)</label>
                <input 
                  type="text" 
                  placeholder="12/28"
                  maxLength="5"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold w-full focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CVV Code</label>
                <input 
                  type="password" 
                  placeholder="•••"
                  maxLength="3"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  onFocus={() => setIsCvvFocused(true)}
                  onBlur={() => setIsCvvFocused(false)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold w-full focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing summary */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/30 p-6 rounded-3xl flex flex-col gap-4">
            <h4 className="font-outfit font-bold text-sm text-slate-800 dark:text-slate-200">Checkout Calculations</h4>
            <div className="flex flex-col gap-2.5 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Rent total:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${monthlyRentTotal} / mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit total:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${securityDepositTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Logistics & Shipping:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${flatShippingCharge}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
              <div className="flex justify-between items-end text-sm">
                <span className="font-bold text-slate-800 dark:text-white">Amount Paid:</span>
                <span className="font-extrabold text-teal-600 dark:text-teal-400 text-xl">${subtotal}</span>
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
                  Authorizing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Authorize & Place Lease
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
