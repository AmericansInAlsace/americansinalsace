import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRegister, handleLogin } from '@/app/actions/auth';
import { GET as verifyEmail } from '@/app/api/auth/verify/route';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';
import { MailService } from '@/services/MailService';
import { IntegrationTestHelper } from './IntegrationTestHelper';

vi.mock('@/services/MailService', () => ({
  MailService: {
    sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Integration: Authentication Flow', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  it('should complete the full registration and verification flow', async () => {
    // 1. Registration Action
    const formData = new FormData();
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    const regResult = await handleRegister(formData);
    expect(regResult.success).toBe(true);

    // Verify user created in DB
    const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    expect(user).toBeDefined();
    expect(user?.verificationToken).toBeDefined();
    expect(MailService.sendVerificationEmail).toHaveBeenCalledWith('test@example.com', user?.verificationToken);

    // 2. Email Verification API
    const request = new NextRequest(`http://localhost/api/auth/verify?token=${user?.verificationToken}`);
    const verifyResponse = await verifyEmail(request);
    
    expect(verifyResponse.status).toBe(307); // Redirect
    expect(verifyResponse.headers.get('location')).toContain('verified=true');

    // Verify emailVerified in DB
    const verifiedUser = await prisma.user.findUnique({ where: { id: user?.id } });
    expect(verifiedUser?.emailVerified).toBeDefined();
    expect(verifiedUser?.emailVerified).not.toBeNull();

    // 3. Login Action
    const loginFormData = new FormData();
    loginFormData.append('email', 'test@example.com');
    loginFormData.append('password', 'password123');

    const loginResult = await handleLogin(loginFormData);
    expect(loginResult.email).toBe('test@example.com');
  });

  it('should fail registration if user already exists', async () => {
    await IntegrationTestHelper.seedTestUser(1, 'exists@example.com');

    const formData = new FormData();
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('email', 'exists@example.com');
    formData.append('password', 'password123');

    const result = await handleRegister(formData);
    expect(result.error).toBe('User already exists');
  });

  it('should fail verification with invalid token', async () => {
    const request = new NextRequest('http://localhost/api/auth/verify?token=invalid');
    const response = await verifyEmail(request);
    expect(response.headers.get('location')).toContain('error=Invalid');
  });

  it('should fail verification if token is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/verify');
    const response = await verifyEmail(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=Missing%20token');
  });
});

