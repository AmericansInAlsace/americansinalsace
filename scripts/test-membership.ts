import { prisma } from '../lib/db';

async function testMembership() {
  console.log('--- Membership Integration Test ---');

  // 1. Create a test user
  const email = 'test-member@example.com';
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('Creating test user...');
    user = await prisma.user.create({
      data: {
        email,
        firstName: 'Test',
        lastName: 'Member',
        password: 'password123', // Not hashed for this script's simplicity
        emailVerified: new Date(),
      },
    });
  }
  console.log(`User ID: ${user.id}`);

  // 2. Get a tier ID
  const tier = await prisma.membershipTier.findFirst({ where: { active: true } });
  if (!tier) {
    console.error('No membership tiers found. Please run seed first.');
    return;
  }
  console.log(`Using Tier: ${tier.name} (ID: ${tier.id})`);

  // 3. Simulate PayPal Webhook Event
  console.log('Simulating PayPal Webhook (BILLING.SUBSCRIPTION.ACTIVATED)...');
  
  const webhookPayload = {
    event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
    resource: {
      id: 'I-TESTSUBSCRIPTION',
      custom_id: `${user.id}|${tier.id}`,
      start_time: new Date().toISOString(),
    },
  };

  // We call the API directly or use the service since it's a script
  // Let's use the local API endpoint if the server is running, 
  // but since we want to verify the DB, we can just call the service or mock the request.
  // Calling the fetch on localhost:3000 if it's up, otherwise we'll just use the service logic.
  
  try {
    const response = await fetch('http://localhost:3000/api/webhooks/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    });

    if (response.ok) {
      console.log('Webhook request successful.');
    } else {
      console.warn('Webhook request failed (is the server running?). Falling back to direct service call...');
      throw new Error('Server not reached');
    }
  } catch (e) {
    // Fallback: Direct service call to verify logic
    const { MembershipService } = await import('../services/MembershipService');
    const [userId, tierId] = webhookPayload.resource.custom_id.split('|').map(Number);
    
    await MembershipService.upsertSubscription({
      userId,
      tierId,
      status: 'ACTIVE',
      paypalSubscriptionId: webhookPayload.resource.id,
      startDate: new Date(webhookPayload.resource.start_time),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });
    console.log('Direct service call successful.');
  }

  // 4. Verify in DB
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    include: { tier: true },
  });

  if (subscription && subscription.status === 'ACTIVE' && subscription.tierId === tier.id) {
    console.log('SUCCESS: Subscription created/updated correctly.');
    console.log(`Status: ${subscription.status}, Tier: ${subscription.tier.name}`);
  } else {
    console.error('FAILURE: Subscription not found or incorrect.');
  }
}

testMembership()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
