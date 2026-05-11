import { NextRequest, NextResponse } from 'next/server';
import { MembershipService } from '@/services/MembershipService';
import { PayPalService } from '@/services/PayPalService';
import { recordManualPayment } from '@/services/FinancialService'; // Import the correct function
import { prisma } from '@/lib/db'; // Import prisma client

/**
 * Handles incoming webhook events from PayPal.
 * It verifies the webhook signature and processes subscription-related events
 * like activations and cancellations to keep the local database in sync.
 *
 * @param {NextRequest} request - The incoming HTTP request from PayPal.
 * @returns {Promise<NextResponse>} A response object indicating the outcome of the event processing.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const headers = Object.fromEntries(request.headers.entries());

  // Verify the webhook signature
  const isValid = await PayPalService.verifyWebhookSignature(body, headers);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventType = body.event_type;
  const resource = body.resource;

  console.log(`Received PayPal Webhook Event: ${eventType}`);

  try {
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.RENEWED': {
        const customId = resource.custom_id; // We'll pass "userId|tierId" in custom_id
        if (!customId) {
          console.warn('Missing custom_id in PayPal resource.');
          break;
        }

        const [userId, tierId] = customId.split('|').map(Number);
        const paypalSubscriptionId = resource.id;
        const startDate = new Date(resource.start_time || Date.now());
        // For annual memberships, set end date to 1 year from now
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        // Upsert the subscription first
        await MembershipService.upsertSubscription({
          userId,
          tierId,
          status: 'ACTIVE',
          paypalSubscriptionId,
          startDate,
          endDate,
        });

        // Now, create a corresponding transaction record
        const membershipTier = await prisma.membershipTier.findUnique({
          where: { id: tierId },
          select: { price: true, name: true },
        });

        if (!membershipTier) {
          console.error(`Membership tier not found for tierId: ${tierId}`);
          return NextResponse.json({ error: 'Membership tier not found' }, { status: 404 });
        }
        
        // Use FinancialService to record the transaction
        await recordManualPayment({
          userId: userId,
          amount: membershipTier.price as any, // Cast if necessary or ensure service handles number
          currency: process.env.NEXT_PUBLIC_CURRENCY || 'EUR', 
          type: 'SUBSCRIPTION_PAYMENT',
          status: 'SUCCESS',
          description: `Subscription payment for ${membershipTier.name}`,
          transactionDate: startDate,
        });

        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const paypalSubscriptionId = resource.id;
        // Find the subscription by paypalSubscriptionId and update its status to INACTIVE
        await prisma.subscription.updateMany({
          where: { paypalSubscriptionId: paypalSubscriptionId },
          data: { status: 'INACTIVE' },
        });
        console.log(`Subscription ${paypalSubscriptionId} marked as INACTIVE.`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error.message);
    // Log the entire error for debugging
    console.error(error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
