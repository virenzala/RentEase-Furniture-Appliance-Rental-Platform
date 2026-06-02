'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productService } from '../../../services/api';
import { useCart } from '../../../hooks/useCart';
import { 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  ShoppingBag,
  Info,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

export default function ProductDetails({ params }) {
  const router = useRouter();
  const { id } = params;
  const { addToCart, cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenure, setSelectedTenure] = useState(6);
  const [activeImage, setActiveImage] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await productService.getById(id);
        setProduct(data);
        setSelectedTenure(data.tenureOptions ? data.tenureOptions[0] : 6);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        }
      } catch (err) {
        console.error('Error fetching product by ID:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-10 animate-pulse mt-4">
        <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 shimmer-card rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="w-full aspect-[4/3] rounded-3xl bg-slate-100 dark:bg-slate-800 shimmer-card" />
          <div className="flex flex-col gap-4">
            <div className="h-10 w-2/3 bg-slate-100 dark:bg-slate-800 shimmer-card rounded" />
            <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 shimmer-card rounded" />
            <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 shimmer-card rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
        <h3 className="font-outfit font-extrabold text-2xl text-slate-800 dark:text-white">Product Not Found</h3>
        <p className="text-slate-500 max-w-sm">The product you are trying to view does not exist or has been removed.</p>
        <Link href="/products" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Live financial aggregates
  const monthlyCost = product.monthlyRent;
  const depositCost = product.securityDeposit;
  const calculatedTotal = (monthlyCost * selectedTenure) + depositCost;

  // Check if item is already added to cart
  const inCart = cartItems.some((item) => item.product._id === product._id);

  const handleAddToCart = () => {
    addToCart(product, selectedTenure);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000); // 3s visual check confirmation
  };

  const deliveryDateEstimate = new Date();
  deliveryDateEstimate.setDate(deliveryDateEstimate.getDate() + 3);

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb / Back Navigation */}
      <div className="flex justify-between items-center">
        <Link 
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Listings
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <span>Catalog</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="capitalize">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="truncate max-w-[120px]">{product.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* LEFT COLUMN: Premium Gallery View */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-md">
            <img 
              src={activeImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {/* Stock Badge Overlay */}
            <span className={`absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-md tracking-wider uppercase backdrop-blur-md ${
              product.stock > 0 
                ? 'bg-emerald-600/90 text-white' 
                : 'bg-red-600/90 text-white'
            }`}>
              {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
            </span>
          </div>

          {/* Sub-gallery selectors (for products with multiple images) */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-24 h-18 aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImage === img
                      ? 'border-teal-600 scale-[1.03] shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.title}-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* SLA Badges Row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200/20 text-center gap-1.5">
              <Truck className="w-5 h-5 text-teal-600" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Express Delivery</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200/20 text-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Refundable Deposit</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200/20 text-center gap-1.5">
              <Wrench className="w-5 h-5 text-teal-600" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Free Day-1 Upkeep</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tenure Calculator & Cart Controls */}
        <div className="flex flex-col gap-6 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm">
          {/* Headline details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-teal-50 dark:bg-teal-950/30 text-teal-600 uppercase tracking-wider">
                {product.category}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {product.city}
              </span>
            </div>
            <h1 className="font-outfit font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white leading-tight">
              {product.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-light mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-700" />

          {/* DYNAMIC TENURE CALCULATOR */}
          <div className="flex flex-col gap-4">
            <h3 className="font-outfit font-extrabold text-sm uppercase tracking-wider text-slate-400">
              1. Choose Rental Tenure
            </h3>
            
            {/* Tenure Options Selector */}
            <div className="grid grid-cols-4 gap-2">
              {product.tenureOptions && product.tenureOptions.map((months) => (
                <button
                  key={months}
                  onClick={() => setSelectedTenure(months)}
                  className={`py-3.5 rounded-2xl font-bold text-sm text-center transition-all border ${
                    selectedTenure === months
                      ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/10 scale-[1.02]'
                      : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  {months} Mo
                </button>
              ))}
            </div>

            {/* Financial math panel */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-700/30 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500 dark:text-slate-400">Monthly Lease Price</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">${monthlyCost} / mo</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500 dark:text-slate-400">Refundable Security Deposit</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">${depositCost}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Est. Checkout Initial Total</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${calculatedTotal}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                <Info className="w-3.5 h-3.5 text-teal-500" />
                Includes fully refundable ${depositCost} deposit. Shipping costs computed in cart.
              </p>
            </div>
          </div>

          {/* Delivery estimate note */}
          <div className="flex items-center gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/30">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div className="text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">Fast White-Glove Setup Available</p>
              <p className="text-slate-500">Order today for direct delivery and assembly by: <span className="font-semibold text-slate-700 dark:text-slate-300">{deliveryDateEstimate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
            </div>
          </div>

          {/* Cart triggers */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-grow py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover-lift ${
                product.stock <= 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : added
                  ? 'bg-emerald-600 text-white shadow-emerald-600/35'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/35'
              }`}
            >
              {added ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Item Added Successfully!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  {inCart ? 'Update Tenure in Cart' : 'Rent This Product'}
                </>
              )}
            </button>
            
            {inCart && (
              <Link 
                href="/cart"
                className="px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm flex items-center justify-center shadow-sm"
              >
                Go to Cart
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
