'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('all');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await productService.getAll();
        // Limit to first 3 items for home page showcase
        setFeatured(data.slice(0, 3));
      } catch (err) {
        console.error('Error loading featured items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push(`/products?search=${search}&city=${city}&category=${category}`);
  };

  return (
    <div className="flex flex-col gap-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-tr from-slate-900 via-slate-800 to-teal-950 text-white px-8 py-20 md:py-28 md:px-16 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/15 border border-teal-500/20 text-teal-400 text-xs font-extrabold tracking-wide uppercase self-start animate-pulse">
            <Sparkles className="w-4 h-4" />
            Elegance meets flexibility
          </div>
          
          <h1 className="font-outfit font-extrabold text-4xl md:text-6xl tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-teal-200">
            Rent Premium Furniture & Appliances
          </h1>
          
          <p className="text-slate-300 md:text-lg leading-relaxed max-w-2xl font-light">
            Unlock flexible, design-forward living. Skip the heavy upfront costs and rigid long-term commitments. Choose your terms, enjoy express white-glove setup, and adjust at your pace.
          </p>

          {/* Interactive Search Bar Panel */}
          <form 
            onSubmit={handleSearchSubmit}
            className="mt-6 p-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col md:flex-row items-center gap-3 w-full border border-white/20"
          >
            {/* Input Search */}
            <div className="relative w-full flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm font-medium placeholder-slate-400"
              />
            </div>

            <div className="h-px md:h-10 w-full md:w-px bg-slate-200 dark:bg-slate-800" />

            {/* City Selection */}
            <div className="relative w-full md:w-60 flex items-center">
              <MapPin className="absolute left-4 w-5 h-5 text-slate-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-12 pr-8 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-300 appearance-none cursor-pointer"
              >
                <option value="all">All Cities</option>
                <option value="New York">New York</option>
                <option value="San Francisco">San Francisco</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
              </select>
            </div>

            <div className="h-px md:h-10 w-full md:w-px bg-slate-200 dark:bg-slate-800" />

            {/* Category selection */}
            <div className="relative w-full md:w-60 flex items-center">
              <TrendingUp className="absolute left-4 w-5 h-5 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-12 pr-8 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-300 appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="furniture">Furniture</option>
                <option value="appliances">Appliances</option>
              </select>
            </div>

            {/* CTA Search Button */}
            <button 
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-600/35 transition-all text-sm hover-lift flex items-center justify-center gap-1"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 2. CATEGORIES OVERVIEW */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <h2 className="font-outfit font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white">
            Curated For Every Corner
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-light">
            Select an expert category to outfit your space with premium items designed for maximum comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Furniture Category banner */}
          <Link 
            href="/products?category=furniture"
            className="group relative h-96 overflow-hidden rounded-[2.5rem] shadow-lg flex flex-col justify-end p-8 text-white border border-slate-200/10 hover-lift"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80" 
              alt="Furniture"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="relative z-20 flex flex-col gap-2">
              <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-extrabold tracking-wider uppercase self-start">
                Cozy Spaces
              </span>
              <h3 className="font-outfit font-extrabold text-3xl">Premium Furniture</h3>
              <p className="text-slate-200 text-sm font-light max-w-sm leading-relaxed">
                Designer linen sofas, sleek solid oak dining structures, and orthopedic beds crafted for high comfort.
              </p>
              <div className="flex items-center gap-1.5 text-teal-400 text-sm font-bold mt-2">
                Explore Furniture
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Appliances Category banner */}
          <Link 
            href="/products?category=appliances"
            className="group relative h-96 overflow-hidden rounded-[2.5rem] shadow-lg flex flex-col justify-end p-8 text-white border border-slate-200/10 hover-lift"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80" 
              alt="Appliances"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="relative z-20 flex flex-col gap-2">
              <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-extrabold tracking-wider uppercase self-start">
                Smart Homes
              </span>
              <h3 className="font-outfit font-extrabold text-3xl">Smart Appliances</h3>
              <p className="text-slate-200 text-sm font-light max-w-sm leading-relaxed">
                Energy-efficient refrigerator modules, low-decibel front-load washing hubs, and high-fidelity smart TVs.
              </p>
              <div className="flex items-center gap-1.5 text-teal-400 text-sm font-bold mt-2">
                Explore Appliances
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SHOWCASE */}
      <section className="flex flex-col gap-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">
              Trending Rentals
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Top curated picks based on design demand and fast delivery.
            </p>
          </div>
          <Link 
            href="/products"
            className="flex items-center gap-1 text-teal-600 hover:text-teal-500 font-bold text-sm"
          >
            See All Items
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200 overflow-hidden bg-white p-6 flex flex-col gap-4 animate-pulse">
                <div className="w-full aspect-[4/3] rounded-2xl bg-slate-100 shimmer-card" />
                <div className="h-6 w-3/4 rounded bg-slate-100 shimmer-card" />
                <div className="h-4 w-1/2 rounded bg-slate-100 shimmer-card" />
                <div className="h-10 w-full rounded bg-slate-100 shimmer-card mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 4. VALUE PROPOSITION */}
      <section className="bg-slate-100 dark:bg-slate-800/40 rounded-[3rem] px-8 py-16 md:px-16 md:py-20 border border-slate-200/50 dark:border-slate-800 flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <h2 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">
            Why Choose RentEase?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-light">
            We operate dynamic logistics to redefine furniture and appliance rental with 100% security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: 'Secure Refunds',
              desc: 'Ultra-low security deposits returned immediately inside a 24-hour verification window.'
            },
            {
              icon: Truck,
              title: 'White-Glove Shipping',
              desc: 'Seamless scheduled shipping with expert delivery and assembly by trained operators.'
            },
            {
              icon: Wrench,
              title: 'Free Upkeep',
              desc: 'Appliance issues or sofa touch-ups handled completely free within an operational day.'
            },
            {
              icon: Sparkles,
              title: 'Flexible Life',
              desc: 'Upgrade your items, extend the lease month-to-month, or return items whenever you relocate.'
            }
          ].map((val, idx) => (
            <div key={idx} className="flex flex-col gap-4 p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/20">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <val.icon className="w-6 h-6" />
              </div>
              <h4 className="font-outfit font-bold text-lg text-slate-900 dark:text-white">{val.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-light">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="flex flex-col gap-10">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <h2 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">
            Loved By Modern Dwellers
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            See how RentEase helps professionals, students, and active families live dynamic, clutter-free lives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "Renting my entire New York studio sofa and washing machine with RentEase saved me over $2,000 in upfront costs. The setup took less than 45 minutes!",
              user: "Marcus Chen",
              role: "Software Engineer, NYC",
              avatar: "MC"
            },
            {
              quote: "The free maintenance feature is incredible. When my rented refrigerator had a minor compressor warning, an engineer was at my apartment within 6 hours to swap it.",
              user: "Elena Rostova",
              role: "Art Curator, San Francisco",
              avatar: "ER"
            },
            {
              quote: "I love the flexible extension options. Being able to scale my furniture lease from 6 to 12 months with a single click in my rentals portal is exceptionally convenient.",
              user: "David Miller",
              role: "Biotech Analyst, Boston",
              avatar: "DM"
            }
          ].map((test, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/30 flex flex-col justify-between">
              <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed mb-6">
                &ldquo;{test.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {test.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{test.user}</h4>
                  <p className="text-xs text-slate-500">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
