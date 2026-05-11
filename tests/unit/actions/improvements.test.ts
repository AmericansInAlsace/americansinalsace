import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as improvementActions from '@/app/actions/improvements';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { JiraService } from '@/services/JiraService';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/db', () => ({
  prisma: {
    improvementCategory: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/services/JiraService', () => ({
  JiraService: {
    createIssue: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('improvement actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getImprovementCategories', () => {
    it('should return categories if authorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      vi.mocked(prisma.improvementCategory.findMany).mockResolvedValue([{ id: 1, name: 'UI' } as any]);

      const result = await improvementActions.getImprovementCategories();
      expect(result).toHaveLength(1);
    });

    it('should throw error if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'USER' } } as any);
      await expect(improvementActions.getImprovementCategories()).rejects.toThrow('Unauthorized');
    });

    it('should throw error if session is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      await expect(improvementActions.getImprovementCategories()).rejects.toThrow('Unauthorized');
    });
  });

  describe('createImprovementCategory', () => {
    it('should create category if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.improvementCategory.create).mockResolvedValue({ id: 1, name: 'New' } as any);

      const result = await improvementActions.createImprovementCategory('New');
      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalled();
    });

    it('should throw error if only ADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(improvementActions.createImprovementCategory('New')).rejects.toThrow('Unauthorized');
    });

    it('should throw error if session missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      await expect(improvementActions.createImprovementCategory('New')).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateImprovementCategory', () => {
    it('should update category if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.improvementCategory.update).mockResolvedValue({ id: 1, name: 'U' } as any);

      const result = await improvementActions.updateImprovementCategory(1, 'U');
      expect(result.success).toBe(true);
      expect(prisma.improvementCategory.update).toHaveBeenCalled();
    });

    it('should throw error if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(improvementActions.updateImprovementCategory(1, 'U')).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteImprovementCategory', () => {
    it('should delete category if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      const result = await improvementActions.deleteImprovementCategory(1);
      expect(result.success).toBe(true);
      expect(prisma.improvementCategory.delete).toHaveBeenCalled();
    });

    it('should throw error if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(improvementActions.deleteImprovementCategory(1)).rejects.toThrow('Unauthorized');
    });
  });

  describe('submitImprovement', () => {
    it('should submit to JIRA and return success', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN', name: 'John', email: 'j@example.com' } } as any);
      vi.mocked(JiraService.createIssue).mockResolvedValue({ key: 'AIA-1' } as any);

      const result = await improvementActions.submitImprovement({ subject: 'S', category: 'C', description: 'D' });
      expect(result.success).toBe(true);
      expect(result.jiraKey).toBe('AIA-1');
      expect(JiraService.createIssue).toHaveBeenCalledWith('S', 'D', 'C', { name: 'John', email: 'j@example.com' });
    });

    it('should use fallback values for missing name and email', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      vi.mocked(JiraService.createIssue).mockResolvedValue({ key: 'AIA-1' } as any);

      await improvementActions.submitImprovement({ subject: 'S', category: 'C', description: 'D' });
      expect(JiraService.createIssue).toHaveBeenCalledWith('S', 'D', 'C', { name: 'Unknown User', email: 'N/A' });
    });

    it('should throw if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'USER' } } as any);
      await expect(improvementActions.submitImprovement({ subject: 'S', category: 'C', description: 'D' })).rejects.toThrow('Unauthorized');
    });

    it('should handle generic errors', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      vi.mocked(JiraService.createIssue).mockRejectedValue(new Error());
      await expect(improvementActions.submitImprovement({ subject: 'S', category: 'C', description: 'D' }))
        .rejects.toThrow('Failed to create JIRA ticket');
    });
  });
});
