import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getImprovementCategories,
  createImprovementCategory,
  updateImprovementCategory,
  deleteImprovementCategory,
  submitImprovement
} from '@/app/actions/improvements';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { getServerSession } from 'next-auth';
import { JiraService } from '@/services/JiraService';

vi.mock('next-auth');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('@/services/JiraService', () => ({
  JiraService: {
    createIssue: vi.fn().mockResolvedValue({ key: 'PROJ-123' }),
  },
}));

describe('Integration: Improvement Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  describe('Authorization Errors', () => {
    it('should throw Unauthorized if not backoffice user for getImprovementCategories', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(getImprovementCategories()).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for createImprovementCategory', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await expect(createImprovementCategory('Cat')).rejects.toThrow('Unauthorized: Only SUPERADMIN can manage categories.');
    });

    it('should throw Unauthorized if not SUPERADMIN for updateImprovementCategory', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await expect(updateImprovementCategory(1, 'Cat')).rejects.toThrow('Unauthorized: Only SUPERADMIN can manage categories.');
    });

    it('should throw Unauthorized if not SUPERADMIN for deleteImprovementCategory', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await expect(deleteImprovementCategory(1)).rejects.toThrow('Unauthorized: Only SUPERADMIN can manage categories.');
    });

    it('should throw Unauthorized if not backoffice user for submitImprovement', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(submitImprovement({ subject: 's', category: 'c', description: 'd' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('Success Paths', () => {
    it('should get categories', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await prisma.improvementCategory.create({ data: { name: 'Bug' } });
      const cats = await getImprovementCategories();
      expect(cats.length).toBeGreaterThan(0);
    });

    it('should create category', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const res = await createImprovementCategory('Feature');
      expect(res.success).toBe(true);
      expect(res.category.name).toBe('Feature');
    });

    it('should update category', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const cat = await prisma.improvementCategory.create({ data: { name: 'Feature' } });
      const res = await updateImprovementCategory(cat.id, 'Enhancement');
      expect(res.success).toBe(true);
      expect(res.category.name).toBe('Enhancement');
    });

    it('should delete category', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const cat = await prisma.improvementCategory.create({ data: { name: 'To Delete' } });
      const res = await deleteImprovementCategory(cat.id);
      expect(res.success).toBe(true);
      const count = await prisma.improvementCategory.count({ where: { id: cat.id } });
      expect(count).toBe(0);
    });

    it('should submit improvement', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN', name: 'Admin', email: 'admin@admin.com' } } as any);
      const res = await submitImprovement({ subject: 'Test', category: 'Bug', description: 'Broken' });
      expect(res.success).toBe(true);
      expect(res.jiraKey).toBe('PROJ-123');
    });

    it('should submit improvement with fallback name and email', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      const res = await submitImprovement({ subject: 'Test', category: 'Bug', description: 'Broken' });
      expect(res.success).toBe(true);
      expect(JiraService.createIssue).toHaveBeenCalledWith('Test', 'Broken', 'Bug', { name: 'Unknown User', email: 'N/A' });
    });

    it('should handle jira failure', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN', name: 'Admin', email: 'admin@admin.com' } } as any);
      vi.mocked(JiraService.createIssue).mockRejectedValueOnce(new Error('Jira Down'));
      await expect(submitImprovement({ subject: 'Test', category: 'Bug', description: 'Broken' })).rejects.toThrow('Jira Down');
    });
  });
});