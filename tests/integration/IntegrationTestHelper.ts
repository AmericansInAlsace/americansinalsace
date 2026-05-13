import { prisma } from '@/lib/db';

export class IntegrationTestHelper {
  /**
   * Clears all data from the database.
   * Useful to call in beforeEach or afterEach.
   */
  static async clearDatabase() {
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '_prisma_migrations';`;

    const tables = tablenames
      .map(({ tablename }) => `"public"."${tablename}"`)
      .join(', ');

    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log('Error clearing database:', error);
    }
  }

  /**
   * Seeds basic data needed for most tests (e.g., Roles, Membership Tiers).
   */
  static async seedBasicData() {
    // Seed Roles
    await prisma.role.upsert({
      where: { name: 'BASIC_USER' },
      update: {},
      create: { name: 'BASIC_USER' },
    });
    await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' },
    });

    // Seed Membership Tiers
    await prisma.membershipTier.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Basic Annual',
        description: 'Basic annual membership',
        price: 20,
        paypalPlanId: 'P-BASIC',
        active: true,
      },
    });
    await prisma.membershipTier.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Premium Monthly',
        description: 'Premium monthly membership',
        price: 19.99,
        paypalPlanId: 'P-PREMIUM',
        active: true,
      },
    });
  }

  /**
   * Seeds a test user with a specific ID.
   */
  static async seedTestUser(id: number, email: string) {
    // Ensure role exists
    await this.seedBasicData();
    const role = await prisma.role.findUnique({ where: { name: 'BASIC_USER' } });

    return prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email,
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        roleId: role?.id,
      },
    });
  }
}
