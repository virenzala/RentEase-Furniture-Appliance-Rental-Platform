'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Information */}
        <div className="flex flex-col gap-4">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            Beautifully designed homes, unlocked with smart furniture and appliance leasing. Live flexible, live premium, live smart.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            &copy; {new Date().getFullYear()} RentEase Inc. All rights reserved.
          </p>
        </div>

        {/* Catalog Categories */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm uppercase font-extrabold tracking-wider text-slate-200">Catalog</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/products?category=furniture" className="hover:text-teal-400 transition-colors">
                Premium Furniture
              </Link>
            </li>
            <li>
              <Link href="/products?category=appliances" className="hover:text-teal-400 transition-colors">
                Smart Appliances
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-teal-400 transition-colors">
                All Products
              </Link>
            </li>
          </ul>
        </div>

        {/* Corporate Support */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm uppercase font-extrabold tracking-wider text-slate-200">Help & Support</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/maintenance" className="hover:text-teal-400 transition-colors">
                File Repair Request
              </Link>
            </li>
            <li>
              <Link href="/rentals" className="hover:text-teal-400 transition-colors">
                Lease Management
              </Link>
            </li>
            <li>
              <span className="text-xs text-slate-500 block">Support Line:</span>
              <span className="text-slate-300 font-medium">+1 (800) 283-4819</span>
            </li>
          </ul>
        </div>

        {/* Location Hubs */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm uppercase font-extrabold tracking-wider text-slate-200">Active Cities</h4>
          <div className="flex flex-wrap gap-2">
            {['New York', 'San Francisco', 'Los Angeles', 'Chicago'].map((city) => (
              <span 
                key={city}
                className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700/50"
              >
                {city}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <h5 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">Subscribe to Offers</h5>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="you@email.com"
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 w-full"
              />
              <button className="bg-teal-600 hover:bg-teal-500 text-white rounded-lg px-3 py-2 text-xs font-bold transition-all">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
