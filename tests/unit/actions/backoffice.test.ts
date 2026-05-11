import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUserRole } from '@/app/actions/backoffice';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('backoffice actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateUserRole', () => {
    it('should successfully update a user role if authorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { role: 'SUPERADMIN' },
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({ id: 1 } as any);

      const result = await updateUserRole(1, 2);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { roleId: 2 },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/backoffice/users');
      expect(result).toEqual({ success: true });
    });

    it('should throw error if not authorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { role: 'USER' },
      } as any);

      await expect(updateUserRole(1, 2)).rejects.toThrow('Unauthorized');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw error if session is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      await expect(updateUserRole(1, 2)).rejects.toThrow('Unauthorized');
    });
  });
});
