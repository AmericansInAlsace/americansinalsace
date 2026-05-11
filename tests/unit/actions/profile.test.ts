import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleUpdateProfile } from '@/app/actions/profile';
import { AuthService } from '@/services/AuthService';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

vi.mock('@/services/AuthService', () => ({
  AuthService: {
    updateUser: vi.fn(),
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

describe('profile actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleUpdateProfile', () => {
    it('should successfully update profile', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1' },
      } as any);

      const formData = new FormData();
      formData.append('firstName', 'John');
      formData.append('lastName', 'Doe');
      formData.append('bio', 'My bio');
      formData.append('phone', '123456');

      vi.mocked(AuthService.updateUser).mockResolvedValue({ id: 1 } as any);

      const result = await handleUpdateProfile(formData);

      expect(AuthService.updateUser).toHaveBeenCalledWith(1, {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'My bio',
        phone: '123456',
      });
      expect(revalidatePath).toHaveBeenCalledWith('/profile');
      expect(result).toEqual({ success: true });
    });

    it('should return error if not logged in', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const formData = new FormData();
      const result = await handleUpdateProfile(formData);

      expect(result).toEqual({ error: 'You must be logged in to update your profile.' });
      expect(AuthService.updateUser).not.toHaveBeenCalled();
    });

    it('should return error if required fields are missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1' },
      } as any);

      const formData = new FormData();
      formData.append('firstName', '');
      formData.append('lastName', 'Doe');

      const result = await handleUpdateProfile(formData);

      expect(result).toEqual({ error: 'First name and last name are required.' });
    });

    it('should return error if AuthService fails', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1' },
      } as any);

      const formData = new FormData();
      formData.append('firstName', 'John');
      formData.append('lastName', 'Doe');

      vi.mocked(AuthService.updateUser).mockRejectedValue(new Error('Update failed'));

      const result = await handleUpdateProfile(formData);

      expect(result).toEqual({ error: 'Update failed' });
    });
  });
});
