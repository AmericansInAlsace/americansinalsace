import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/AuthService';
import { MembershipService } from '@/services/MembershipService';
import { prisma } from '@/lib/db';
import argon2 from 'argon2';

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
    subscription: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    membershipTier: {
      findMany: vi.fn(),
    }
  },
}));

vi.mock('argon2', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed'),
    verify: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('@/services/MailService', () => ({
  MailService: {
    sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Functional: User Onboarding & Membership Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.role.findUnique).mockResolvedValue({ id: 1, name: 'BASIC_USER' } as any);
  });

  it('should complete the full onboarding and subscription cycle', async () => {
    // 1. Registration
    const userData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 10, ...userData, roleId: 1 } as any);

    const registeredUser = await AuthService.registerUser(userData);
    expect(registeredUser.id).toBe(10);
    expect(prisma.user.create).toHaveBeenCalled();

    // 2. Email Verification
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 10,
      verificationToken: 'token',
      tokenExpires: new Date(Date.now() + 10000)
    } as any);

    const verified = await AuthService.verifyEmail('token');
    expect(verified).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 10 },
      data: expect.objectContaining({ emailVerified: expect.any(Date) })
    }));

    // 3. Subscription Activation (via webhook logic)
    const subscriptionData = {
      userId: 10,
      tierId: 2,
      status: 'ACTIVE',
      paypalSubscriptionId: 'I-SUBS',
    };

    vi.mocked(prisma.subscription.upsert).mockResolvedValue({ id: 100, ...subscriptionData } as any);

    const sub = await MembershipService.upsertSubscription(subscriptionData);
    expect(sub.status).toBe('ACTIVE');
    expect(prisma.subscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 10 }
    }));
  });
});
