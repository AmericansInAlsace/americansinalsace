
import { PrismaClient } from '../lib/generated/prisma_dev';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import argon2 from 'argon2';

const connectionString = process.env.DATABASE_URL?.replace('@db:', '@localhost:');
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting dev seeding...');

  // 1. Clean up mock data only (don't delete roles, tiers, or categories seeded by seed.ts)
  await prisma.transaction.deleteMany({});
  await prisma.rSVP.deleteMany({});
  await prisma.sponsorship.deleteMany({});
  await prisma.sponsorProfile.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.event.deleteMany({});

  // 2. Fetch existing Roles
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPERADMIN' } });
  const basicUserRole = await prisma.role.findUnique({ where: { name: 'BASIC_USER' } });
  
  if (!superAdminRole || !basicUserRole) {
    throw new Error('Roles not found. Please run npm run db:seed first.');
  }

  // 3. Create Admin account
  const adminPassword = await argon2.hash('admin');
  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@americansinalsace.com',
      password: adminPassword,
      emailVerified: new Date(),
      roleId: superAdminRole.id,
    },
  });
  console.log('Created admin/admin account with SUPERADMIN role.');

  // 4. Use existing Membership Tiers
  const membershipTiers = await prisma.membershipTier.findMany();

  // 5. Use existing Sponsor Tiers
  const sponsorTiers = await prisma.sponsorTier.findMany();
  if (sponsorTiers.length === 0) {
    throw new Error('Sponsor Tiers not found. Please run npm run db:seed first.');
  }


  // 6. Create Mock Users & Associated Data
  const usersToCreate = 100;
  for (let i = 0; i < usersToCreate; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const isSponsor = Math.random() < 0.1; // 10% are sponsors
    const isMember = !isSponsor && Math.random() < 0.9; // 90% of non-sponsors are members

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: 'password-placeholder',
        emailVerified: new Date(),
        roleId: basicUserRole.id,
        createdAt: faker.date.past({ years: 2 }),
      },
    });

    // Create subscription for members
    if (isMember) {
      const tier = faker.helpers.arrayElement(membershipTiers);
      const status = faker.helpers.arrayElement(['ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED']);
      const isActuallyActive = status === 'ACTIVE';
      const hasTransaction = ['ACTIVE', 'CANCELLED', 'EXPIRED'].includes(status);

      await prisma.subscription.create({
        data: {
          userId: user.id,
          tierId: tier.id,
          status: status,
          startDate: status !== 'PENDING' ? faker.date.past({ years: 1 }) : null,
          endDate: status === 'EXPIRED' ? faker.date.past() : (status === 'PENDING' ? null : faker.date.future({ years: 1 })),
        },
      });

      // Create transaction for memberships that are/were active
      if (hasTransaction) {
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

  // 7. Create Events using existing categories
  const eventCategories = await prisma.eventCategory.findMany();

  // One-off events
  for (let i = 0; i < 5; i++) {
    const memberPrice = faker.number.float({ min: 20, max: 30, fractionDigits: 2 });
    await prisma.event.create({
      data: {
        title: faker.lorem.sentence(4),
        description: faker.lorem.paragraphs(3),
        date: faker.date.future(),
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
     const memberPrice = faker.number.float({ min: 20, max: 30, fractionDigits: 2 });
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
            categoryId: eventCategories[0].id, // Default to first category
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
