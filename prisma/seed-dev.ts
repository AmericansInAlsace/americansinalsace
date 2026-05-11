
import { PrismaClient } from '../lib/generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting dev seeding...');

  // 1. Clean up existing data
  await prisma.transaction.deleteMany({});
  await prisma.rSVP.deleteMany({});
  await prisma.sponsorship.deleteMany({});
  await prisma.sponsorProfile.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.eventCategory.deleteMany({});
  await prisma.membershipTier.deleteMany({});
  await prisma.sponsorTier.deleteMany({});
  await prisma.role.deleteMany({});


  // 2. Create Roles
  const adminRole = await prisma.role.create({ data: { name: 'admin' } });
  const memberRole = await prisma.role.create({ data: { name: 'member' } });
  const sponsorRole = await prisma.role.create({ data: { name: 'sponsor' } });

  // 3. Create Membership Tiers
  const tiers = await prisma.membershipTier.createMany({
    data: [
      { name: 'Student', description: 'For students.', price: 30.00 },
      { name: 'Individual', description: 'For single members.', price: 50.00 },
      { name: 'Family', description: 'For families.', price: 85.00 },
    ],
  });
  const membershipTiers = await prisma.membershipTier.findMany();

  // 4. Create Sponsor Tiers
  await prisma.sponsorTier.createMany({
    data: [
        { name: 'Bronze', description: 'Basic sponsorship.', price: 500, priority: 1 },
        { name: 'Silver', description: 'Mid-level sponsorship.', price: 1000, priority: 2 },
        { name: 'Gold', description: 'Premium sponsorship.', price: 2500, priority: 3 },
    ]
  })
  const sponsorTiers = await prisma.sponsorTier.findMany();


  // 5. Create Users & Associated Data
  const usersToCreate = 100;
  let adminCreated = false;
  for (let i = 0; i < usersToCreate; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const isSponsor = Math.random() < 0.1; // 10% are sponsors
    const isMember = !isSponsor && Math.random() < 0.9; // 90% of non-sponsors are members
    const isActiveMember = isMember && Math.random() > 0.15; // 85% of members are active

    let roleId = memberRole.id;
    if (!adminCreated) {
        roleId = adminRole.id;
        adminCreated = true;
    } else if (isSponsor) {
        roleId = sponsorRole.id;
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: 'password-placeholder', // In a real scenario, this should be hashed
        emailVerified: new Date(),
        roleId: roleId,
        createdAt: faker.date.past({ years: 2 }),
      },
    });

    // Create subscription for members
    if (isMember) {
      const tier = faker.helpers.arrayElement(membershipTiers);
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          tierId: tier.id,
          status: isActiveMember ? 'ACTIVE' : 'INACTIVE',
          startDate: isActiveMember ? faker.date.past({ years: 1 }) : null,
          endDate: isActiveMember ? faker.date.future({ years: 1 }) : null,
        },
      });

      // Create transaction for active members
      if (isActiveMember) {
        await prisma.transaction.create({
          data: {
            userId: user.id,
            amount: tier.price,
            currency: 'EUR',
            type: 'MEMBERSHIP',
            status: 'SUCCESS',
            description: `Membership dues for ${tier.name}`,
          },
        });
      }
    }

    // Create sponsor profile and sponsorship
    if (isSponsor) {
        const sponsorTier = faker.helpers.arrayElement(sponsorTiers);
        await prisma.sponsorProfile.create({
            data: {
                userId: user.id,
                companyName: faker.company.name(),
                websiteUrl: faker.internet.url(),
                logoUrl: faker.image.avatar(),
                bio: faker.lorem.paragraph(),
            }
        });
        await prisma.sponsorship.create({
            data: {
                userId: user.id,
                tierId: sponsorTier.id,
                startDate: faker.date.past({ years: 1 }),
                endDate: faker.date.future({ years: 1 }),
                status: 'ACTIVE',
            }
        });
         await prisma.transaction.create({
          data: {
            userId: user.id,
            amount: sponsorTier.price,
            currency: 'EUR',
            type: 'SPONSORSHIP',
            status: 'SUCCESS',
            description: `Sponsorship payment for ${sponsorTier.name}`,
          },
        });
    }
  }

  // 6. Create Event Categories and Events
  const eventCategories = await Promise.all([
      prisma.eventCategory.create({ data: { name: 'Social Gathering', description: 'General get-togethers.' } }),
      prisma.eventCategory.create({ data: { name: 'Holiday Special', description: 'Events for special holidays.' } }),
      prisma.eventCategory.create({ data: { name: 'Workshop', description: 'Educational workshops.' } }),
      prisma.eventCategory.create({ data: { name: 'Recurring Meetup', description: 'Our regular monthly meetups.' } }),
  ]);

  // One-off events
  for (let i = 0; i < 5; i++) {
    const memberPrice = faker.number.float({ min: 20, max: 30, precision: 0.01 });
    await prisma.event.create({
      data: {
        title: faker.lorem.sentence(4),
        description: faker.lorem.paragraphs(3),
        date: faker.date.future({ months: 6 }),
        location: faker.location.streetAddress(),
        capacity: faker.number.int({ min: 20, max: 100 }),
        memberPrice: memberPrice,
        nonMemberPrice: memberPrice + 10,
        published: true,
        categoryId: faker.helpers.arrayElement(eventCategories).id,
      },
    });
  }

  // Recurring event
  for (let i = 0; i < 6; i++) {
     const memberPrice = faker.number.float({ min: 20, max: 30, precision: 0.01 });
     const eventDate = new Date();
     eventDate.setMonth(eventDate.getMonth() + i);
     await prisma.event.create({
        data: {
            title: `Monthly Members Meetup #${i + 1}`,
            description: "Join us for our regular monthly get-together!",
            date: eventDate,
            location: 'Central Perk, Strasbourg',
            capacity: 50,
            memberPrice: memberPrice,
            nonMemberPrice: memberPrice + 5,
            published: true,
            categoryId: eventCategories.find(c => c.name === 'Recurring Meetup')!.id,
        }
     })
  }
   // Simulate some event signups and transactions
  const allUsers = await prisma.user.findMany();
  const allEvents = await prisma.event.findMany({where: {published: true}});

  for (const user of allUsers) {
      if (Math.random() < 0.3) { // 30% of users sign up for an event
          const event = faker.helpers.arrayElement(allEvents);
          const isMember = await prisma.subscription.findFirst({ where: { userId: user.id, status: 'ACTIVE' } });
          const price = isMember ? event.memberPrice : event.nonMemberPrice;

          await prisma.rSVP.create({
              data: {
                  userId: user.id,
                  eventId: event.id
              }
          });

          await prisma.transaction.create({
              data: {
                  userId: user.id,
                  amount: price,
                  currency: 'EUR',
                  type: 'EVENT',
                  status: 'SUCCESS',
                  description: `Ticket for ${event.title}`,
              }
          });
      }
  }


  console.log('Dev seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
