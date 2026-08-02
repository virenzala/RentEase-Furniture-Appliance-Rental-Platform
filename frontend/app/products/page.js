'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { 
  SlidersHorizontal, 
  Search, 
  MapPin, 
  TrendingUp, 
  RotateCcw, 
  Inbox,
  FilterX
} from 'lucide-react';

function ProductsListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load URL queries initially
  const initialCategory = searchParams.get('category') || 'all';
  const initialCity = searchParams.get('city') || 'all';
  const initialSearch = searchParams.get('search') || '';

  // State Management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [minRent, setMinRent] = useState(0);
  const [maxRent, setMaxRent] = useState(200);
  const [sort, setSort] = useState('newest');

  // Sync URL search parameters with state
  useEffect(() => {
    const qCat = searchParams.get('category') || 'all';
    const qCity = searchParams.get('city') || 'all';
    const qSearch = searchParams.get('search') || '';
    setCategory(qCat);
    setCity(qCity);
    setSearch(qSearch);
  }, [searchParams]);

  // Trigger loading products on query changes
  useEffect(() => {
    async function loadFilteredProducts() {
      setLoading(true);
      try {
        const filters = {
          category: category !== 'all' ? category : undefined,
          city: city !== 'all' ? city : undefined,
          search: search.trim() ? search.trim() : undefined,
          minRent: minRent > 0 ? minRent : undefined,
          maxRent: maxRent < 200 ? maxRent : undefined,
          sort
        };
        const data = await productService.getAll(filters);
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching filtered products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    
    // Quick debounce simulation for slider filters
    const handler = setTimeout(() => {
      loadFilteredProducts();
    }, 150);

    return () => clearTimeout(handler);
  }, [category, city, search, minRent, maxRent, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setCity('all');
    setMinRent(0);
    setMaxRent(200);
    setSort('newest');
    router.push('/products');
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Intro Header */}
      <div>
        <h1 className="font-outfit font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white">
          Explore Our Lease Catalog
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Outfit your home with award-winning furniture and energy-efficient appliances.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* SIDEBAR FILTERS PANEL */}
        <aside className="w-full lg:w-80 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-6 flex flex-col gap-6 shadow-sm sticky top-28">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/50">
            <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-600" />
              Filter Items
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-xs font-bold text-teal-600 hover:text-teal-500 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Search</label>
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-0 focus:outline-none w-full text-sm font-medium placeholder-slate-400"
              />
            </div>
          </div>

          {/* Category Toggle Buttons */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Category</label>
            <div className="flex flex-col gap-2">
              {['all', 'furniture', 'appliances'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold text-left transition-all border ${
                    category === cat
                      ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/10'
                      : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* City Selection Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">City Location</label>
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-1">
              <MapPin className="w-4 h-4 text-slate-400 mr-2" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent border-0 focus:outline-none w-full text-sm font-semibold text-slate-700 dark:text-slate-300 py-2.5 cursor-pointer"
              >
                <option value="all">All Cities</option>
                <option value="New York">New York</option>
                <option value="San Francisco">San Francisco</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
              </select>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Monthly Rent</label>
              <span className="text-xs font-bold text-teal-600">${minRent} - ${maxRent}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="range"
                min="0"
                max="200"
                value={maxRent}
                onChange={(e) => setMaxRent(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Sort By</label>
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-1">
              <TrendingUp className="w-4 h-4 text-slate-400 mr-2" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent border-0 focus:outline-none w-full text-sm font-semibold text-slate-700 dark:text-slate-300 py-2.5 cursor-pointer"
              >
                <option value="newest">Newest Releases</option>
                <option value="price-asc">Rent: Low to High</option>
                <option value="price-desc">Rent: High to Low</option>
              </select>
            </div>
          </div>
        </aside>

        {/* MAIN PRODUCT LISTINGS AREA */}
        <main className="flex-grow w-full">
          {loading ? (
            /* Shimmer loading layout placeholder */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="rounded-3xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden bg-white dark:bg-slate-800 p-6 flex flex-col gap-4 animate-pulse">
                  <div className="w-full aspect-[4/3] rounded-2xl bg-slate-100 shimmer-card" />
                  <div className="h-6 w-3/4 rounded bg-slate-100 shimmer-card" />
                  <div className="h-4 w-1/2 rounded bg-slate-100 shimmer-card" />
                  <div className="h-10 w-full rounded bg-slate-100 shimmer-card mt-2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty filters alert block */
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-[2.5rem] shadow-sm max-w-lg mx-auto mt-10">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 mb-4">
                <FilterX className="w-8 h-8" />
              </div>
              <h3 className="font-outfit font-extrabold text-xl text-slate-800 dark:text-white mb-2">No Matching Products</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-light">
                We couldn&apos;t find any items matching your exact filters. Try loosening your pricing limits or removing keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md hover-lift transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Standard Grid Layout render */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsListing() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-sm text-slate-500 font-semibold">Loading Catalog...</div>}>
      <ProductsListingContent />
    </Suspense>
  );
}
