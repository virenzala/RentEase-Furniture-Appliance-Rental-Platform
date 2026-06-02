'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../hooks/useCart';
import { authService } from '../services/api';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  Wrench, 
  Calendar 
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Monitor scroll for premium navbar shrink
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monitor auth changes on path navigation
  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setDropdownOpen(false);
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    ...(user ? [
      { name: 'My Rentals', path: '/rentals', icon: Calendar },
      { name: 'Maintenance', path: '/maintenance', icon: Wrench }
    ] : [])
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md border-b border-slate-200/50 dark:border-slate-800/50' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20">
            RE
          </div>
          <span className="font-outfit font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-teal-700 dark:from-white dark:to-teal-400 bg-clip-text text-transparent">
            RentEase
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`font-medium transition-colors hover:text-teal-600 text-sm ${
                pathname === link.path 
                  ? 'text-teal-600 font-semibold' 
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Operations Hub */}
        <div className="hidden md:flex items-center gap-5">
          {/* Cart Icon Link */}
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Auth Dropdown */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold max-w-[120px] truncate text-slate-700 dark:text-slate-200 pr-2">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-50">
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700 mb-2">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.email}</p>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider text-teal-600 mt-0.5">{user.role}</p>
                  </div>

                  {(user.role === 'admin' || user.role === 'vendor') && (
                    <Link 
                      href="/admin" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-teal-600" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link 
                    href="/rentals" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                  >
                    <Calendar className="w-4 h-4 text-teal-600" />
                    My Rentals
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-sm font-bold shadow-md hover-lift"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Navbar Hamburger Controls */}
        <div className="flex md:hidden items-center gap-4">
          <Link href="/cart" className="relative p-2 text-slate-700 dark:text-slate-200">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-200"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Side Panel Drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 px-6 flex flex-col gap-5 shadow-lg animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              onClick={() => setMenuOpen(false)}
              className={`font-semibold text-lg ${
                pathname === link.path ? 'text-teal-600' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{user.name}</h4>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              
              {(user.role === 'admin' || user.role === 'vendor') && (
                <Link 
                  href="/admin" 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium text-slate-700 dark:text-slate-200"
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-600" />
                  Admin Dashboard
                </Link>
              )}

              <button 
                onClick={handleLogout}
                className="w-full text-left py-2.5 font-bold text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setMenuOpen(false)}
              className="w-full py-3.5 text-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold block shadow-md"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
