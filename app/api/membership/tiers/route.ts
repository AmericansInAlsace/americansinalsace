import { NextResponse } from 'next/server';
import { MembershipService } from '@/services/MembershipService';

/**
 * Handles GET requests to retrieve all active membership tiers.
 * It calls the MembershipService to fetch data from the database.
 *
 * @returns {Promise<NextResponse>} A response object containing an array of active tiers or an error message.
 */
export async function GET() {
  try {
    const tiers = await MembershipService.getActiveTiers();
    return NextResponse.json({ tiers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
