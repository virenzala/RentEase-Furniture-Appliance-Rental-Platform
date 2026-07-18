'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight } from 'lucide-react';

export default function ProductCard({ product }) {
  const { _id, title, category, monthlyRent, securityDeposit, images, city, tenureOptions } = product;
  const displayImage = images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover-lift flex flex-col justify-between">
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
        <Image 
          src={displayImage} 
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Category & City Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 backdrop-blur-sm shadow-sm">
            {category}
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-teal-600/95 text-white flex items-center gap-1 shadow-sm">
            <MapPin className="w-3 h-3" />
            {city}
          </span>
        </div>
      </div>

      {/* Product Details Area */}
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-teal-600 transition-colors">
            {title}
          </h3>
          
          {/* Rent & Deposit breakdown */}
          <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/20">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rent</p>
              <p className="text-xl font-extrabold text-teal-600 dark:text-teal-400">
                ${monthlyRent}<span className="text-xs font-normal text-slate-400">/mo</span>
              </p>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700/50 pl-4">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deposit</p>
              <p className="text-xl font-extrabold text-slate-700 dark:text-slate-300">
                ${securityDeposit}
              </p>
            </div>
          </div>

          {/* Tenure Badges */}
          <div className="mb-4">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Tenure Options</p>
            <div className="flex flex-wrap gap-1.5">
              {tenureOptions && tenureOptions.map((opt) => (
                <span 
                  key={opt}
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-600/30"
                >
                  {opt} mo
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link 
          href={`/products/${_id}`}
          className="w-full mt-2 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-teal-600 dark:hover:bg-teal-600 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-md group/btn"
        >
          View Details
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
