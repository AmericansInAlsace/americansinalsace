import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/auth/verify/route';
import { NextRequest } from 'next/server';
import { AuthService } from '@/services/AuthService';

describe('Integration: API Auth Verify', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should redirect with missing token error if no token is provided', async () => {
    const request = new NextRequest('http://localhost/api/auth/verify');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/?error=Missing%20token');
  });

  it('should redirect with success message if verification is successful', async () => {
    vi.spyOn(AuthService, 'verifyEmail').mockResolvedValue(true);
    const request = new NextRequest('http://localhost/api/auth/verify?token=valid-token');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/?verified=true');
    expect(AuthService.verifyEmail).toHaveBeenCalledWith('valid-token');
  });

  it('should redirect with error message if verification fails', async () => {
    vi.spyOn(AuthService, 'verifyEmail').mockRejectedValue(new Error('Invalid token'));
    const request = new NextRequest('http://localhost/api/auth/verify?token=invalid-token');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/?error=Invalid%20token');
  });
});
