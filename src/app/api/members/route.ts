
import { NextResponse } from 'next/server';
import { members } from '@/lib/data';

export async function GET() {
  // In a real app, you might fetch this from a database
  return NextResponse.json(members);
}
