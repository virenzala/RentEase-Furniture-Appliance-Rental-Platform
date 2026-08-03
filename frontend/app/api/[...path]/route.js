import { NextResponse } from 'next/server';

// Import local DB handlers & models directly
const { Product, checkDbHealth, readDb, User, Rental, MaintenanceRequest } = require('../../../backend/config/db');

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const pathParts = (resolvedParams && resolvedParams.path) ? resolvedParams.path : [];
  const endpoint = pathParts.join('/');
  const { searchParams } = new URL(request.url);

  // Health check endpoint
  if (endpoint === 'health') {
    try {
      const dbHealth = await checkDbHealth();
      return NextResponse.json({
        status: dbHealth.connected ? 'healthy' : 'degraded',
        message: 'RentEase Full-Stack Backend running successfully',
        timestamp: new Date().toISOString(),
        database: dbHealth
      });
    } catch (e) {
      return NextResponse.json({
        status: 'degraded',
        message: 'RentEase catalog running on local datastore',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Products catalog listing endpoint
  if (endpoint === 'products' || endpoint === 'products/' || endpoint === '') {
    try {
      const category = searchParams.get('category');
      const city = searchParams.get('city');
      const search = searchParams.get('search');
      const minRent = searchParams.get('minRent');
      const maxRent = searchParams.get('maxRent');
      const sort = searchParams.get('sort');

      let products = await Product.find();
      if (!Array.isArray(products) || products.length === 0) {
        const db = readDb();
        products = (db && Array.isArray(db.products)) ? db.products : [];
      }

      if (category && category !== 'all') {
        const catLower = String(category).toLowerCase();
        products = products.filter(p => p && p.category && String(p.category).toLowerCase() === catLower);
      }
      if (city && city !== 'all') {
        const cityLower = String(city).toLowerCase();
        products = products.filter(p => p && p.city && String(p.city).toLowerCase() === cityLower);
      }
      if (search) {
        const term = String(search).toLowerCase();
        products = products.filter(p => 
          p && ((p.title && String(p.title).toLowerCase().includes(term)) || 
          (p.description && String(p.description).toLowerCase().includes(term)))
        );
      }
      if (minRent) {
        products = products.filter(p => p && Number(p.monthlyRent || 0) >= Number(minRent));
      }
      if (maxRent) {
        products = products.filter(p => p && Number(p.monthlyRent || 0) <= Number(maxRent));
      }
      if (sort) {
        if (sort === 'price-asc') {
          products.sort((a, b) => (a.monthlyRent || 0) - (b.monthlyRent || 0));
        } else if (sort === 'price-desc') {
          products.sort((a, b) => (b.monthlyRent || 0) - (a.monthlyRent || 0));
        } else if (sort === 'newest') {
          products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
      }

      return NextResponse.json(products);
    } catch (e) {
      console.error('Error fetching products in API route:', e);
      try {
        const db = readDb();
        return NextResponse.json(db.products || []);
      } catch (err) {
        return NextResponse.json([]);
      }
    }
  }

  // Single Product lookup endpoint
  if (pathParts[0] === 'products' && pathParts[1]) {
    try {
      const prod = await Product.findById(pathParts[1]);
      if (!prod) {
        const db = readDb();
        const found = (db.products || []).find(p => p._id === pathParts[1]);
        if (found) return NextResponse.json(found);
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(prod);
    } catch (e) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
  }

  return NextResponse.json({ message: `Route /api/${endpoint} not found` }, { status: 404 });
}

export async function POST(request, { params }) {
  return NextResponse.json({ status: 'ok' });
}

export async function PUT(request, { params }) {
  return NextResponse.json({ status: 'ok' });
}

export async function DELETE(request, { params }) {
  return NextResponse.json({ status: 'ok' });
}
