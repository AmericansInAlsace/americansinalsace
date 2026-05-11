import { prisma } from '../lib/db';

async function main() {
  const tiers = [
    {
      name: 'Young Adult',
      description: 'For members aged 25 and under.',
      price: 15.0,
      active: true,
    },
    {
      name: 'Individual Adult',
      description: 'Standard single membership.',
      price: 20.0,
      active: true,
    },
    {
      name: 'Adult Couple',
      description: 'For two adults residing at the same address.',
      price: 40.0,
      active: true,
    },
    {
      name: 'Family Membership',
      description: 'Full family access (Adults + Children).',
      price: 50.0,
      active: true,
    },
  ];

  console.log('Seeding membership tiers...');

  for (const tier of tiers) {
    await prisma.membershipTier.upsert({
      where: { paypalPlanId: tier.name.toLowerCase().replace(/\s+/g, '_') }, // Using generated plan ID
      update: tier,
      create: {
        ...tier,
        paypalPlanId: tier.name.toLowerCase().replace(/\s+/g, '_'),
      },
    });
  }

  console.log('Seeding permissions...');

  const models = ['User', 'MembershipTier', 'Subscription', 'Role', 'Permission', 'Backoffice', 'Event', 'EventCategory', 'RSVP', 'EmailTemplate', 'EmailLog'];
  const actions = ['READ', 'WRITE'] as const;

  for (const model of models) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: {
          action_resource: {
            action,
            resource: model,
          },
        },
        update: {},
        create: {
          action,
          resource: model,
        },
      });
    }
  }

  console.log('Seeding roles...');

  // 1. SUPERADMIN
  const allPermissions = await prisma.permission.findMany();
  await prisma.role.upsert({
    where: { name: 'SUPERADMIN' },
    update: {
      permissions: {
        set: allPermissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: 'SUPERADMIN',
      permissions: {
        connect: allPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  // 2. BASIC_USER
  const basicPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'MembershipTier', action: 'READ' },
        { resource: 'User', action: 'READ' }, // Usually for their own profile, but model-level is READ
      ],
    },
  });

  await prisma.role.upsert({
    where: { name: 'BASIC_USER' },
    update: {
      permissions: {
        set: basicPermissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: 'BASIC_USER',
      permissions: {
        connect: basicPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  console.log('Assigning role to admin user (if exists)...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@americansinalsace.com';
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPERADMIN' } });
  
  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (adminUser && superAdminRole) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { roleId: superAdminRole.id },
    });
    console.log(`Assigned SUPERADMIN role to ${adminEmail}`);
  }

  console.log('Seeding event categories...');
  const categories = [
    { name: 'Coffee Morning', description: 'Casual meetups for coffee and conversation.' },
    { name: 'Happy Hour', description: 'Monthly happy hour events.' },
    { name: 'Wine Tasting', description: 'Evening events exploring local and international wines.' },
    { name: 'Hiking', description: 'Outdoor adventures and nature walks.' },
    { name: 'Cultural Tour', description: 'Visits to museums, historical sites, and local landmarks.' },
    { name: 'Annual Gala', description: 'Our signature black-tie events.' },
    { name: 'Book Club', description: 'Monthly book discussion meetings.' },
  ];

  for (const category of categories) {
    await prisma.eventCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
  }

  console.log('Seeding sponsor tiers...');
  const sponsorTiers = [
    { name: 'Silver', description: 'Mid-level sponsorship.', price: 100, priority: 1 },
    { name: 'Gold', description: 'Premium sponsorship.', price: 400, priority: 2 },
    { name: 'Platinum', description: 'Top-tier sponsorship.', price: 800, priority: 3 },
  ];

  for (const tier of sponsorTiers) {
    await prisma.sponsorTier.upsert({
      where: { name: tier.name },
      update: tier,
      create: tier,
    });
  }

  console.log('Seeding email templates...');
  const templates = [
    {
      slug: 'verification-email',
      name: 'Email Verification',
      subject: 'Verify your email address',
      content: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h1 style="color: #3C3B6E; font-family: serif;">Welcome to Americans in Alsace!</h1>
          <p>Thank you for joining our community. Please verify your email address to activate your account:</p>
          <div style="margin: 30px 0;">
            <a href="{{actionUrl}}" style="background-color: #E30613; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p style="color: #6b7280; font-size: 0.875rem;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #6b7280; font-size: 0.875rem;">{{actionUrl}}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 0.75rem; color: #9ca3af;">&copy; 2026 Americans in Alsace. This is an automated message.</p>
        </div>
      `,
    },
    {
      slug: 'reset-password',
      name: 'Password Reset',
      subject: 'Reset your password',
      content: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h1 style="color: #3C3B6E; font-family: serif;">Password Reset Request</h1>
          <p>We received a request to reset your password for your Americans in Alsace account. Click the button below to choose a new password:</p>
          <div style="margin: 30px 0;">
            <a href="{{actionUrl}}" style="background-color: #E30613; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 0.875rem;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
          <p style="color: #6b7280; font-size: 0.875rem;">{{actionUrl}}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 0.75rem; color: #9ca3af;">&copy; 2026 Americans in Alsace. This is an automated message.</p>
        </div>
      `,
    },
    {
      slug: 'data-export',
      name: 'User Data Export',
      subject: 'Your Data Export Request',
      content: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h1 style="color: #3C3B6E; font-family: serif;">Your Data Export is Ready</h1>
          <p>Hi {{userName}},</p>
          <p>As requested, we have prepared an export of all personal data associated with your Americans in Alsace account.</p>
          <p>You will find a JSON file attached to this email containing your profile information, activity history, and transaction records.</p>
          <p>If you did not request this export, please contact us immediately at <a href="mailto:security@americansinalsace.fr">security@americansinalsace.fr</a>.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 0.75rem; color: #9ca3af;">&copy; 2026 Americans in Alsace. This is an automated message.</p>
        </div>
      `,
    },
    {
      slug: 'event-rsvp-confirmation',
      name: 'Event RSVP Confirmation',
      subject: 'Registration Confirmed: {{eventTitle}}',
      content: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h1 style="color: #3C3B6E; font-family: serif;">Registration Confirmed!</h1>
          <p>Hi {{userName}},</p>
          <p>Your registration for <strong>{{eventTitle}}</strong> has been confirmed.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date:</strong> {{eventDate}}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> {{eventLocation}}</p>
          </div>
          <p>We look forward to seeing you there!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 0.75rem; color: #9ca3af;">&copy; 2026 Americans in Alsace. This is an automated message.</p>
        </div>
      `,
    },
    {
      slug: 'event-reminder',
      name: 'Event Reminder',
      subject: 'Reminder: {{eventTitle}} is coming up!',
      content: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h1 style="color: #3C3B6E; font-family: serif;">Upcoming Event Reminder</h1>
          <p>Hi {{userName}},</p>
          <p>This is a friendly reminder that <strong>{{eventTitle}}</strong> is happening soon!</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date:</strong> {{eventDate}}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> {{eventLocation}}</p>
          </div>
          <p>Don't forget to mark your calendar. See you soon!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 0.75rem; color: #9ca3af;">&copy; 2026 Americans in Alsace. This is an automated message.</p>
        </div>
      `,
    },
  ];

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { slug: template.slug },
      update: template,
      create: template,
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
