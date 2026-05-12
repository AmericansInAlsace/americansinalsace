// tests/integration/PayPalWebhook.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/paypal/route';
import { MembershipService } from '@/services/MembershipService';
import { PayPalService } from '@/services/PayPalService';
import * as FinancialService from '@/services/FinancialService';
import { prisma } from '@/lib/db'; // Mock prisma for direct DB interactions
import { NextRequest } from 'next/server';
import { Prisma } from '@/lib/generated/prisma';

// Mock all services and prisma client used by the webhook handler
vi.mock('@/services/MembershipService');
vi.mock('@/services/PayPalService');
vi.mock('@/services/FinancialService');
vi.mock('@/lib/db', () => ({
  prisma: {
    membershipTier: {
      findUnique: vi.fn(),
    },
    subscription: {
      updateMany: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
  },
}));

// Cast mocks to their correct types for easier access to mock functions
const mockedMembershipService = MembershipService as vi.Mocked<typeof MembershipService>;
const mockedPayPalService = PayPalService as vi.Mocked<typeof PayPalService>;
const mockedFinancialService = FinancialService as vi.Mocked<typeof FinancialService>;
const mockedPrisma = prisma as vi.Mocked<PrismaClient>;

describe('Integration: PayPal Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Resetting prisma mocks as well if they are granular
    mockedPrisma.membershipTier.findUnique.mockReset();
    mockedPrisma.subscription.updateMany.mockReset();
    mockedPrisma.transaction.create.mockReset(); // Mocking create for FinancialService test if it uses prisma directly
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
        custom_id: '1|2',
        start_time: '2026-05-09T10:00:00Z',
      },
    };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);
    mockedMembershipService.upsertSubscription.mockResolvedValue(undefined);
    mockedPrisma.membershipTier.findUnique.mockResolvedValue({
      id: 2,
      name: 'Premium Monthly',
      price: new Prisma.Decimal('19.99'),
      currency: 'USD',
      paypalPlanId: 'PLAN_ABC',
      active: true,
    });
    mockedFinancialService.recordManualPayment.mockResolvedValue({ // Mocking recordManualPayment as it's used
      id: 101, userId: 1, amount: new Prisma.Decimal('19.99'), currency: 'USD', type: 'SUBSCRIPTION_PAYMENT', status: 'SUCCESS',
      transactionDate: new Date('2026-05-09T10:00:00Z'), createdAt: new Date(), updatedAt: new Date(),
      paypalTransactionId: null, description: 'Subscription payment for Premium Monthly'
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);

    expect(mockedPayPalService.verifyWebhookSignature).toHaveBeenCalled();
    expect(mockedMembershipService.upsertSubscription).toHaveBeenCalledWith(expect.objectContaining({
      userId: 1,
      tierId: 2,
      status: 'ACTIVE',
      paypalSubscriptionId: 'SUB_ID_123',
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    }));
    expect(mockedPrisma.membershipTier.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
      select: { price: true, name: true },
    });
    expect(mockedFinancialService.recordManualPayment).toHaveBeenCalledWith(expect.objectContaining({
      userId: 1,
      amount: new Prisma.Decimal('19.99'),
      currency: 'USD',
      type: 'SUBSCRIPTION_PAYMENT',
      status: 'SUCCESS',
      description: 'Subscription payment for Premium Monthly',
      transactionDate: expect.any(Date),
    }));
  });

  it('should process BILLING.SUBSCRIPTION.RENEWED and create transaction', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.RENEWED',
      resource: {
        id: 'SUB_ID_456',
        custom_id: '3|4',
        start_time: '2026-05-10T11:00:00Z',
      },
    };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);
    mockedMembershipService.upsertSubscription.mockResolvedValue(undefined);
    mockedPrisma.membershipTier.findUnique.mockResolvedValue({
      id: 4,
      name: 'Pro Annual',
      price: new Prisma.Decimal('199.99'),
      currency: 'USD',
      paypalPlanId: 'PLAN_XYZ',
      active: true,
    });
    mockedFinancialService.recordManualPayment.mockResolvedValue({
      id: 102, userId: 3, amount: new Prisma.Decimal('199.99'), currency: 'USD', type: 'SUBSCRIPTION_PAYMENT', status: 'SUCCESS',
      transactionDate: new Date('2026-05-10T11:00:00Z'), createdAt: new Date(), updatedAt: new Date(),
      paypalTransactionId: null, description: 'Subscription payment for Pro Annual'
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(mockedMembershipService.upsertSubscription).toHaveBeenCalledWith(expect.objectContaining({ userId: 3, tierId: 4, paypalSubscriptionId: 'SUB_ID_456' }));
    expect(mockedPrisma.membershipTier.findUnique).toHaveBeenCalledWith({ where: { id: 4 }, select: { price: true, name: true } });
    expect(mockedFinancialService.recordManualPayment).toHaveBeenCalledWith(expect.objectContaining({ userId: 3, amount: new Prisma.Decimal('199.99'), description: 'Subscription payment for Pro Annual' }));
  });

  it('should update subscription status for CANCELLED event', async () => {
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
    expect(mockedPrisma.subscription.updateMany).toHaveBeenCalledWith({
      where: { paypalSubscriptionId: 'SUB_ID_789' },
      data: { status: 'INACTIVE' },
    });
  });

  it('should update subscription status for EXPIRED event', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.EXPIRED',
      resource: { id: 'SUB_ID_789' },
    };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(mockedPrisma.subscription.updateMany).toHaveBeenCalledWith({
      where: { paypalSubscriptionId: 'SUB_ID_789' },
      data: { status: 'INACTIVE' },
    });
  });

  it('should ignore unhandled event types', async () => {
    const mockPayload = { event_type: 'PAYMENT.SALE.COMPLETED', resource: { id: 'PAY_ID_111' } };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(mockedMembershipService.upsertSubscription).not.toHaveBeenCalled();
    expect(mockedPrisma.membershipTier.findUnique).not.toHaveBeenCalled();
    expect(mockedFinancialService.recordManualPayment).not.toHaveBeenCalled();
    expect(mockedPrisma.subscription.updateMany).not.toHaveBeenCalled();
  });

  it('should return 401 if signature verification fails', async () => {
    const mockPayload = { event_type: 'BILLING.SUBSCRIPTION.ACTIVATED', resource: { id: 'SUB_ID_XYZ', custom_id: '1|2' } };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'invalid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(false);

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Invalid signature');
    expect(mockedMembershipService.upsertSubscription).not.toHaveBeenCalled();
  });

  it('should return 500 if membership tier is not found', async () => {
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
    mockedMembershipService.upsertSubscription.mockResolvedValue(undefined);
    mockedPrisma.membershipTier.findUnique.mockResolvedValue(null); // Tier not found

    const response = await POST(mockRequest);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Membership tier not found');

    expect(mockedPrisma.membershipTier.findUnique).toHaveBeenCalledWith({ where: { id: 999 }, select: { price: true, name: true } });
    expect(mockedFinancialService.recordManualPayment).not.toHaveBeenCalled(); // Transaction should not be created
  });

  it('should return 500 if recordManualPayment fails', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: {
        id: 'SUB_ID_123',
        custom_id: '1|2',
        start_time: '2026-05-09T10:00:00Z',
      },
    };
    const mockRequest = createMockRequest(mockPayload, { 'paypal-signature': 'valid-signature' });

    mockedPayPalService.verifyWebhookSignature.mockResolvedValue(true);
    mockedMembershipService.upsertSubscription.mockResolvedValue(undefined);
    mockedPrisma.membershipTier.findUnique.mockResolvedValue({
      id: 2, name: 'Premium Monthly', price: new Prisma.Decimal('19.99'), paypalPlanId: 'PLAN_ABC', active: true,
    } as any);
    mockedFinancialService.recordManualPayment.mockRejectedValue(new Error('Financial Service Error')); // Simulate error

    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Webhook processing failed');
  });
});
