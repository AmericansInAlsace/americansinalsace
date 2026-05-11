import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRegister, handleLogin } from '@/app/actions/auth';
import { GET as verifyEmail } from '@/app/api/auth/verify/route';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';
import { MailService } from '@/services/MailService';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    role: {
      findUnique: vi.fn(),
    },
    emailTemplate: {
      findUnique: vi.fn(),
    },
    emailLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/services/MailService', () => ({
  MailService: {
    sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Integration: Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete the full registration and verification flow', async () => {
    // 1. Registration Action
    const formData = new FormData();
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null); // No existing user
    vi.mocked(prisma.role.findUnique).mockResolvedValue({ id: 1, name: 'BASIC_USER' } as any);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      verificationToken: 'token123',
    } as any);

    const regResult = await handleRegister(formData);
    expect(regResult.success).toBe(true);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(MailService.sendVerificationEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));

    // 2. Email Verification API
    const request = new NextRequest('http://localhost/api/auth/verify?token=token123');
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 1,
      verificationToken: 'token123',
      tokenExpires: new Date(Date.now() + 10000),
    } as any);

    const verifyResponse = await verifyEmail(request);
    expect(verifyResponse.status).toBe(307); // Redirect
    expect(verifyResponse.headers.get('location')).toContain('verified=true');
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: expect.objectContaining({ emailVerified: expect.any(Date) }),
    }));

    // 3. Login Action (preparation)
    const loginFormData = new FormData();
    loginFormData.append('email', 'test@example.com');
    loginFormData.append('password', 'password123');

    const loginResult = await handleLogin(loginFormData);
    expect(loginResult.email).toBe('test@example.com');
    expect(loginResult.password).toBe('password123');
  });

  it('should fail registration if user already exists', async () => {
    const formData = new FormData();
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('email', 'exists@example.com');
    formData.append('password', 'password123');

    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1 } as any);

    const result = await handleRegister(formData);
    expect(result.error).toBe('User already exists');
  });

  it('should fail verification with invalid token', async () => {
    const request = new NextRequest('http://localhost/api/auth/verify?token=invalid');
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

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
