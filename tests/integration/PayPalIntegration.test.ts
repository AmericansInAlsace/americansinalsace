import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/paypal/route';
import { MembershipService } from '@/services/MembershipService';
import { PayPalService } from '@/services/PayPalService';
import { NextRequest } from 'next/server';
import { Prisma } from '@/lib/generated/prisma';

vi.mock('@/services/MembershipService');
vi.mock('@/services/PayPalService');
vi.mock('@/services/FinancialService', () => ({
  recordManualPayment: vi.fn(),
}));
vi.mock('@/lib/db', () => ({
  prisma: {
    membershipTier: {
      findUnique: vi.fn(),
    },
    subscription: {
      updateMany: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/db';
import * as FinancialService from '@/services/FinancialService';

describe('Integration: PayPal Webhook -> Membership Activation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process an activated subscription and update the database', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: {
        id: 'I-123',
        custom_id: '1|2',
        start_time: '2026-05-08T12:00:00Z',
      },
    };

    const request = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: JSON.stringify(mockPayload),
    });

    vi.mocked(PayPalService.verifyWebhookSignature).mockResolvedValue(true);
    vi.mocked(prisma.membershipTier.findUnique).mockResolvedValue({
      id: 2,
      name: 'Test Tier',
      price: new Prisma.Decimal('10.00'),
    } as any);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);

    // Verify interaction between Webhook and MembershipService
    expect(MembershipService.upsertSubscription).toHaveBeenCalledWith(expect.objectContaining({
      userId: 1,
      tierId: 2,
      status: 'ACTIVE',
      paypalSubscriptionId: 'I-123',
    }));
    
    expect(FinancialService.recordManualPayment).toHaveBeenCalled();
  });

  it('should process a cancelled subscription', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
      resource: {
        id: 'I-123',
      },
    };

    const request = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: JSON.stringify(mockPayload),
    });

    vi.mocked(PayPalService.verifyWebhookSignature).mockResolvedValue(true);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(prisma.subscription.updateMany).toHaveBeenCalledWith({
      where: { paypalSubscriptionId: 'I-123' },
      data: { status: 'INACTIVE' },
    });
  });

  it('should ignore activation event if custom_id is missing', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: {
        id: 'I-123',
      },
    };

    const request = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: JSON.stringify(mockPayload),
    });

    vi.mocked(PayPalService.verifyWebhookSignature).mockResolvedValue(true);

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(MembershipService.upsertSubscription).not.toHaveBeenCalled();
  });

  it('should handle unhandled event types gracefully', async () => {
    const mockPayload = {
      event_type: 'SOME.UNKNOWN.EVENT',
      resource: { id: '123' },
    };

    const request = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: JSON.stringify(mockPayload),
    });

    vi.mocked(PayPalService.verifyWebhookSignature).mockResolvedValue(true);

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should return 500 if an error occurs during processing', async () => {
    const mockPayload = {
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: {
        id: 'I-123',
        custom_id: '1|2',
      },
    };

    const request = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: JSON.stringify(mockPayload),
    });

    vi.mocked(PayPalService.verifyWebhookSignature).mockResolvedValue(true);
    vi.mocked(MembershipService.upsertSubscription).mockRejectedValue(new Error('DB Error'));

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Webhook processing failed');
  });

  it('should return 401 if webhook signature is invalid', async () => {
    const request = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    vi.mocked(PayPalService.verifyWebhookSignature).mockResolvedValue(false);

    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(MembershipService.upsertSubscription).not.toHaveBeenCalled();
  });
});