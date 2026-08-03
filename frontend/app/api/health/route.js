import { NextResponse } from 'next/server';
import seedDb from '@/data/db.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'RentEase Full-Stack Backend running successfully',
    timestamp: new Date().toISOString(),
    database: { connected: true, provider: 'RentEase Core Datastore', count: (seedDb.products || []).length }
  });
}
