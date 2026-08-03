import { NextResponse } from 'next/server';
import seedDb from '@/data/db.json';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const minRent = searchParams.get('minRent');
    const maxRent = searchParams.get('maxRent');
    const sort = searchParams.get('sort');

    let products = Array.isArray(seedDb.products) ? [...seedDb.products] : [];

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
    return NextResponse.json(seedDb.products || []);
  }
}
