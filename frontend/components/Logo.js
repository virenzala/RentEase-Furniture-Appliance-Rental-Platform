'use client';

import React from 'react';
import Image from 'next/image';

export default function Logo({ size = 'md', showText = true, className = '' }) {
  const dimensions = {
    sm: { box: 'w-8 h-8', img: 32, text: 'text-lg', badge: 'rounded-lg' },
    md: { box: 'w-10 h-10', img: 40, text: 'text-2xl', badge: 'rounded-xl' },
    lg: { box: 'w-12 h-12', img: 48, text: 'text-3xl', badge: 'rounded-2xl' }
  }[size] || { box: 'w-10 h-10', img: 40, text: 'text-2xl', badge: 'rounded-xl' };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${dimensions.box} ${dimensions.badge} overflow-hidden bg-slate-900 border border-teal-500/30 shadow-md shadow-teal-500/20 flex items-center justify-center group transition-transform hover:scale-105`}>
        <Image 
          src="/logo.png" 
          alt="RentEase Logo" 
          width={dimensions.img} 
          height={dimensions.img}
          className="object-cover w-full h-full"
          priority
        />
      </div>

      {showText && (
        <span className={`font-outfit font-extrabold ${dimensions.text} tracking-tight bg-gradient-to-r from-slate-900 via-teal-700 to-emerald-600 dark:from-white dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent`}>
          RentEase
        </span>
      )}
    </div>
  );
}
