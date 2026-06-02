'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage upon mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('rentease_cart');
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (e) {
          console.error('Error parsing cart data', e);
        }
      }
      setLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      localStorage.setItem('rentease_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const addToCart = (product, tenure = 6) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product._id === product._id);
      if (existingItem) {
        // If product already in cart, update its tenure
        return prevItems.map((item) =>
          item.product._id === product._id ? { ...item, tenure: Number(tenure) } : item
        );
      }
      // Add fresh item
      return [...prevItems, { product, tenure: Number(tenure) }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product._id !== productId));
  };

  const updateTenure = (productId, tenure) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product._id === productId ? { ...item, tenure: Number(tenure) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Financial aggregates
  const monthlyRentTotal = cartItems.reduce(
    (sum, item) => sum + item.product.monthlyRent,
    0
  );

  const securityDepositTotal = cartItems.reduce(
    (sum, item) => sum + item.product.securityDeposit,
    0
  );

  const flatShippingCharge = cartItems.length > 0 ? 30 : 0;
  
  const subtotal = monthlyRentTotal + securityDepositTotal + flatShippingCharge;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateTenure,
        clearCart,
        monthlyRentTotal,
        securityDepositTotal,
        flatShippingCharge,
        subtotal,
        itemCount: cartItems.length,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
