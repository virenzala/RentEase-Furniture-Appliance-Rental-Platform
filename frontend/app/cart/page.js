'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../hooks/useCart';
import { authService } from '../../services/api';
import { getProductImage, handleImageError } from '../../utils/imageUtils';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  ArrowLeft,
  Info 
} from 'lucide-react';

export default function Cart() {
  const router = useRouter();
  const { 
    cartItems, 
    removeFromCart, 
    updateTenure, 
    monthlyRentTotal, 
    securityDepositTotal, 
    flatShippingCharge, 
    subtotal 
  } = useCart();

  const [isClient, setIsClient] = useState(false);

  // Avoid Hydration errors by checking client mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col gap-10 animate-pulse mt-4">
        <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 shimmer-card rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 h-96 bg-slate-100 dark:bg-slate-800 shimmer-card rounded-3xl" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800 shimmer-card rounded-3xl" />
        </div>
      </div>
    );
  }

  const handleCheckoutRedirect = () => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/login?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300 mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 font-light">
          It looks like you haven&apos;t selected any premium furniture or appliances yet. Explore our catalog to choose customizable terms.
        </p>
        <Link 
          href="/products" 
          className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-600/35 hover-lift transition-all text-sm"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">Shopping Cart</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Review your selected leases, adjust lease terms, and check deposit details.
          </p>
        </div>
        <Link 
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Add More Items
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* LEFT COLUMN: Items Listing */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {cartItems.map((item) => {
            const { product, tenure } = item;
            return (
              <div 
                key={product._id} 
                className="group relative rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 flex flex-col sm:flex-row gap-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                {/* Product Image */}
                <div className="w-full sm:w-32 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.title} 
                    onError={(e) => handleImageError(e, product.category)}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details Hub */}
                <div className="flex-grow flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white leading-tight">
                        {product.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                        {product.category} &bull; {product.city}
                      </p>
                    </div>
                    {/* Delete Action */}
                    <button 
                      onClick={() => removeFromCart(product._id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="Remove product"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {/* Dynamic Tenure Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lease Duration</label>
                      <select
                        value={tenure}
                        onChange={(e) => updateTenure(product._id, Number(e.target.value))}
                        className="w-full py-2 px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:border-teal-500"
                      >
                        {product.tenureOptions && product.tenureOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt} Months
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rent display */}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Monthly Rent</p>
                      <p className="text-base font-extrabold text-teal-600 dark:text-teal-400 mt-1">
                        ${product.monthlyRent}<span className="text-xs font-normal text-slate-400">/mo</span>
                      </p>
                    </div>

                    {/* Deposit display */}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Refundable Deposit</p>
                      <p className="text-base font-extrabold text-slate-700 dark:text-slate-300 mt-1">
                        ${product.securityDeposit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Costs Summary Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6 sticky top-28">
          <h3 className="font-outfit font-extrabold text-lg text-slate-900 dark:text-white">Lease Cost Summary</h3>

          {/* Pricing calculations */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500">First Month Rent Subtotal</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">${monthlyRentTotal}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500">Refundable Deposit Total</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">${securityDepositTotal}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500">Logistics & Shipping Fee</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">${flatShippingCharge}</span>
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Checkout Total</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Payable at initial order placement</p>
              </div>
              <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                ${subtotal}
              </p>
            </div>
          </div>

          {/* Trust points */}
          <div className="flex flex-col gap-2.5 mt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Security deposits returned fully within 24h of returns.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Truck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Includes professional unpacking & installation.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Rent auto-bills monthly starting on Month 2.</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={handleCheckoutRedirect}
            className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-2xl font-bold flex items-center justify-center gap-1.5 shadow-lg hover-lift transition-all text-sm"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
