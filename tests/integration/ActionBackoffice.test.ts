import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getDashboardStats, 
  recordManualPaymentAction, 
  updateUserRole,
  updateSubscriptionStatus,
  updateSubscriptionTier,
  createEvent,
  updateEvent,
  getAllTransactions
} from '@/app/actions/backoffice';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { getServerSession } from 'next-auth';
import { Prisma } from '@/lib/generated/prisma';

vi.mock('next-auth');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Integration: Backoffice Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  describe('Authorization Errors', () => {
    it('should throw Unauthorized if not SUPERADMIN for getDashboardStats', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(getDashboardStats()).rejects.toThrow('Unauthorized');
      vi.mocked(getServerSession).mockResolvedValue(null);
      await expect(getDashboardStats()).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for recordManualPaymentAction', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(recordManualPaymentAction({} as any)).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for getAllTransactions', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(getAllTransactions()).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for updateUserRole', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(updateUserRole(1, 1)).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for updateSubscriptionStatus', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(updateSubscriptionStatus(1, 'ACTIVE')).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for updateSubscriptionTier', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(updateSubscriptionTier(1, 1)).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for createEvent', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(createEvent({})).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for updateEvent', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(updateEvent(1, {})).rejects.toThrow('Unauthorized');
    });
  });

  describe('Success Paths', () => {
    it('should fetch dashboard stats for SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ 
        user: { id: 1, role: 'SUPERADMIN' } 
      } as any);

      await IntegrationTestHelper.seedTestUser(1, 'user1@example.com');
      await prisma.transaction.create({
        data: {
          userId: 1,
          amount: new Prisma.Decimal(50.00),
          type: 'SUBSCRIPTION_PAYMENT',
          status: 'SUCCESS',
          description: 'Test payment',
        }
      });

      const stats = await getDashboardStats();
      expect(stats.totalRevenue).toBe(50.00);
      expect(stats.numberOfTransactions).toBe(1);
    });

    it('should fetch all transactions for SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ 
        user: { id: 1, role: 'SUPERADMIN' } 
      } as any);

      await IntegrationTestHelper.seedTestUser(1, 'user1@example.com');
      await prisma.transaction.create({
        data: {
          userId: 1,
          amount: new Prisma.Decimal(50.00),
          type: 'SUBSCRIPTION_PAYMENT',
          status: 'SUCCESS',
          description: 'Test payment',
        }
      });

      const transactions = await getAllTransactions();
      expect(transactions.length).toBe(1);
      expect(transactions[0].amount).toBe(50.00);
      expect(transactions[0].user?.email).toBe('user1@example.com');
    });

    it('should record a manual payment', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ 
        user: { id: 1, role: 'SUPERADMIN' } 
      } as any);
      await IntegrationTestHelper.seedTestUser(10, 'member@example.com');

      const result = await recordManualPaymentAction({
        userId: 10,
        amount: new Prisma.Decimal(100.00),
        currency: 'EUR',
        type: 'DONATION',
        status: 'SUCCESS',
        description: 'Generous donation',
        transactionDate: new Date(),
      } as any);

      expect(result.success).toBe(true);
      expect(result.transaction.amount).toBe(100.00);

      const tx = await prisma.transaction.findFirst({ where: { userId: 10 } });
      expect(tx?.description).toBe('Generous donation');
    });

    it('should throw an error for recordManualPaymentAction if userId is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ 
        user: { id: 1, role: 'SUPERADMIN' } 
      } as any);

      await expect(recordManualPaymentAction({} as any)).rejects.toThrow('User ID is required for manual payment.');
    });

    it('should update user role', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ 
        user: { id: 1, role: 'SUPERADMIN' } 
      } as any);
      const user = await IntegrationTestHelper.seedTestUser(10, 'user@example.com');
      const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

      const result = await updateUserRole(10, adminRole!.id);
      expect(result.success).toBe(true);

      const updatedUser = await prisma.user.findUnique({ where: { id: 10 } });
      expect(updatedUser?.roleId).toBe(adminRole!.id);
    });

    it('should update subscription status', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ 
        user: { id: 1, role: 'SUPERADMIN' } 
      } as any);
      const user = await IntegrationTestHelper.seedTestUser(10, 'user@example.com');
      const tier = await prisma.membershipTier.findFirst();
      
      const sub = await prisma.subscription.create({
        data: {
          userId: 10,
          tierId: tier!.id,
          status: 'PENDING',
          startDate: new Date(),
          endDate: new Date(),
        }
      });

      const result = await updateSubscriptionStatus(sub.id, 'ACTIVE');
      expect(result.success).toBe(true);

      const updatedSub = await prisma.subscription.findUnique({ where: { id: sub.id } });
      expect(updatedSub?.status).toBe('ACTIVE');
    });

    it('should update subscription tier', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ 
        user: { id: 1, role: 'SUPERADMIN' } 
      } as any);
      const user = await IntegrationTestHelper.seedTestUser(10, 'user@example.com');
      const tier1 = await prisma.membershipTier.findUnique({ where: { id: 1 } });
      const tier2 = await prisma.membershipTier.findUnique({ where: { id: 2 } });
      
      const sub = await prisma.subscription.create({
        data: {
          userId: 10,
          tierId: tier1!.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(),
        }
      });

      const result = await updateSubscriptionTier(sub.id, tier2!.id);
      expect(result.success).toBe(true);

      const updatedSub = await prisma.subscription.findUnique({ where: { id: sub.id } });
      expect(updatedSub?.tierId).toBe(tier2!.id);
    });

    it('should create an event', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ 
        user: { id: 1, role: 'SUPERADMIN' } 
      } as any);

      const category = await prisma.eventCategory.create({
        data: { name: 'Social', description: 'Social events' }
      });

      const eventData = {
        title: 'Coffee Morning',
        description: 'Weekly meetup',
        location: 'Strasbourg',
        date: '2026-06-01T10:00:00Z',
        categoryId: category.id,
        published: true,
      };

      const result = await createEvent(eventData);
      expect(result.success).toBe(true);
      expect(result.event.title).toBe('Coffee Morning');

      const event = await prisma.event.findFirst({ where: { title: 'Coffee Morning' } });
      expect(event).toBeDefined();
    });

    it('should update an event', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ 
        user: { id: 1, role: 'SUPERADMIN' } 
      } as any);

      const category = await prisma.eventCategory.create({
        data: { name: 'Social', description: 'Social events' }
      });

      const event = await prisma.event.create({
        data: {
          title: 'Coffee Morning',
          description: 'Weekly meetup',
          location: 'Strasbourg',
          date: new Date('2026-06-01T10:00:00Z'),
          categoryId: category.id,
          published: false,
          memberPrice: 0,
          nonMemberPrice: 0,
        }
      });

      const eventData = {
        title: 'Coffee Morning Updated',
        description: 'Weekly meetup updated',
        location: 'Strasbourg 2',
        date: '2026-06-02T10:00:00Z',
        categoryId: category.id,
        published: true,
        capacity: '50',
        reminder1DaysBefore: '7',
        reminder2DaysBefore: '1',
      };

      const result = await updateEvent(event.id, eventData);
      expect(result.success).toBe(true);
      expect(result.event.title).toBe('Coffee Morning Updated');

      const updatedEvent = await prisma.event.findUnique({ where: { id: event.id } });
      expect(updatedEvent?.title).toBe('Coffee Morning Updated');
      expect(updatedEvent?.published).toBe(true);
    });
  });

  describe('Internal Server Errors', () => {
    it('should throw an error for getDashboardStats if db fails', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      vi.spyOn(prisma.transaction, 'aggregate').mockRejectedValueOnce(new Error('DB Error'));
      await expect(getDashboardStats()).rejects.toThrow('Failed to fetch dashboard statistics.');
    });

    it('should throw an error for recordManualPaymentAction if db fails', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      vi.spyOn(prisma.transaction, 'create').mockRejectedValueOnce(new Error('DB Error'));
      await expect(recordManualPaymentAction({
        userId: 1, amount: new Prisma.Decimal(10), currency: 'EUR', type: 'DONATION', status: 'SUCCESS'
      } as any)).rejects.toThrow('Failed to record manual payment.');
    });

    it('should throw an error for getAllTransactions if db fails', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      vi.spyOn(prisma.transaction, 'findMany').mockRejectedValueOnce(new Error('DB Error'));
      await expect(getAllTransactions()).rejects.toThrow('Failed to fetch transactions.');
    });
  });
});