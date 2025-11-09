
import { NextResponse } from 'next/server';
import { whitelistedDomains } from '@/lib/data';

export async function GET() {
  // In a real app, you might fetch this from a database
  return NextResponse.json(whitelistedDomains);
}
