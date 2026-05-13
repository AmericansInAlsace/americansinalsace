// tests/integration/PayPalWebhook.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/paypal/route';
import { PayPalService } from '@/services/PayPalService';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';
import { IntegrationTestHelper } from './IntegrationTestHelper';

// Mock only external PayPalService
vi.mock('@/services/PayPalService');

const mockedPayPalService = PayPalService as vi.Mocked<typeof PayPalService>;

describe('Integration: PayPal Webhook Handler', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
    // Seed test users
    await IntegrationTestHelper.seedTestUser(1, 'user1@example.com');
    await IntegrationTestHelper.seedTestUser(3, 'user3@example.com');
  });

  // Helper to create a mock NextRequest
  const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
    const request = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: new Headers(headers),
    });
    return request;
  };

  it('should process BILLING.SUBSCRIPTION.ACTIVATED and create transaction', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: {
        id: 'SUB_ID_123',
        custom_id: '1|2', // User 1, Tier 2
        start_time: '2026-05-09T10:00:00Z',
      },
    };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);

    // Verify DB state for Subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: 1 },
    });
    expect(subscription).toBeDefined();
    expect(subscription?.status).toBe('ACTIVE');
    expect(subscription?.tierId).toBe(2);
    expect(subscription?.paypalSubscriptionId).toBe('SUB_ID_123');

    // Verify DB state for Transaction
    const transaction = await prisma.transaction.findFirst({
      where: { userId: 1, type: 'SUBSCRIPTION_PAYMENT' },
    });
    expect(transaction).toBeDefined();
    expect(transaction?.amount.toString()).toBe('19.99');
    expect(transaction?.currency).toBe('EUR');
    expect(transaction?.status).toBe('SUCCESS');
  });

  it('should process BILLING.SUBSCRIPTION.RENEWED and create transaction', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.RENEWED',
      resource: {
        id: 'SUB_ID_456',
        custom_id: '3|1', // User 3, Tier 1 (Basic)
        start_time: '2026-05-10T11:00:00Z',
      },
    };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);

    // Verify DB state
    const subscription = await prisma.subscription.findUnique({ where: { userId: 3 } });
    expect(subscription?.tierId).toBe(1);

    const transaction = await prisma.transaction.findFirst({
      where: { userId: 3, type: 'SUBSCRIPTION_PAYMENT' },
    });
    expect(transaction?.amount.toString()).toBe('20');
  });

  it('should update subscription status for CANCELLED event', async () => {
    // Setup existing subscription
    await prisma.subscription.create({
      data: {
        userId: 1,
        tierId: 2,
        status: 'ACTIVE',
        paypalSubscriptionId: 'SUB_ID_789',
      },
    });

    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
      resource: { id: 'SUB_ID_789' },
    };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);

    const subscription = await prisma.subscription.findUnique({ where: { userId: 1 } });
    expect(subscription?.status).toBe('INACTIVE');
  });

  it('should update subscription status for EXPIRED event', async () => {
    // Setup existing subscription
    await prisma.subscription.create({
      data: {
        userId: 1,
        tierId: 2,
        status: 'ACTIVE',
        paypalSubscriptionId: 'SUB_ID_EXP',
      },
    });

    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.EXPIRED',
      resource: { id: 'SUB_ID_EXP' },
    };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);

    const subscription = await prisma.subscription.findUnique({ where: { userId: 1 } });
    expect(subscription?.status).toBe('INACTIVE');
  });

  it('should ignore unhandled event types', async () => {
    const mockPayload = { event_type: 'PAYMENT.SALE.COMPLETED', resource: { id: 'PAY_ID_111' } };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);

    const subCount = await prisma.subscription.count();
    expect(subCount).toBe(0);
  });

  it('should return 401 if signature verification fails', async () => {
    const mockPayload = { event_type: 'BILLING.SUBSCRIPTION.ACTIVATED', resource: { id: 'SUB_ID_XYZ', custom_id: '1|2' } };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'invalid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(false);

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Invalid signature');
  });

  it('should return 404 if membership tier is not found', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: {
        id: 'SUB_ID_123',
        custom_id: '1|999', // Tier ID 999 does not exist
        start_time: '2026-05-09T10:00:00Z',
      },
    };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);

    const response = await POST(mockRequest);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Membership tier not found');
  });

  it('should return 500 if DB operation fails (e.g. invalid custom_id format)', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: {
        id: 'SUB_ID_123',
        custom_id: 'invalid', // Not "userId|tierId"
        start_time: '2026-05-09T10:00:00Z',
      },
    };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);

    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Webhook processing failed');
  });
});
