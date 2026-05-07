import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  const users = await query<{ id: number; name: string }>(
    'SELECT id, name FROM users ORDER BY id'
  );
  return NextResponse.json({ users });
}
