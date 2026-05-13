import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleUpdateProfile } from '@/app/actions/profile';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { getServerSession } from 'next-auth';

vi.mock('next-auth');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Integration: Profile Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  it('should return error if not logged in', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const fd = new FormData();
    const res = await handleUpdateProfile(fd);
    expect(res.error).toBe('You must be logged in to update your profile.');
  });

  it('should return error if first name or last name is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1 } } as any);
    const fd = new FormData();
    fd.append('firstName', '');
    const res = await handleUpdateProfile(fd);
    expect(res.error).toBe('First name and last name are required.');
  });

  it('should handle db error gracefully', async () => {
    const user = await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: user.id } } as any);
    vi.spyOn(prisma.user, 'update').mockRejectedValueOnce(new Error('DB Error'));
    
    const fd = new FormData();
    fd.append('firstName', 'John');
    fd.append('lastName', 'Doe');
    
    const res = await handleUpdateProfile(fd);
    expect(res.error).toBe('Failed to update profile.');
  });

  it('should update profile successfully', async () => {
    const user = await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: user.id } } as any);
    
    const fd = new FormData();
    fd.append('firstName', 'Jane');
    fd.append('lastName', 'Smith');
    fd.append('bio', 'My bio');
    fd.append('phone', '123456');
    
    const res = await handleUpdateProfile(fd);
    expect(res.success).toBe(true);
    
    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.firstName).toBe('Jane');
    expect(updated?.lastName).toBe('Smith');
    expect(updated?.bio).toBe('My bio');
  });
});