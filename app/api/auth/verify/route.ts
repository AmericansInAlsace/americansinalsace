import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

/**
 * Handles GET requests for email verification. It processes a verification
 * token from the URL search parameters to activate a user's account.
 *
 * @param {NextRequest} request - The incoming HTTP request, containing the verification token in the URL.
 * @returns {Promise<NextResponse>} A redirect response to the home page with a success or error query parameter.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=Missing token', request.url));
  }

  try {
    await AuthService.verifyEmail(token);
    // Redirect to home with success message
    return NextResponse.redirect(new URL('/?verified=true', request.url));
  } catch (error: any) {
    console.error('Email verification error:', error.message);
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url));
  }
}
