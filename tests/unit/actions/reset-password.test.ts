import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRequestReset, handleResetPassword } from '@/app/actions/reset-password';
import { AuthService } from '@/services/AuthService';

vi.mock('@/services/AuthService', () => ({
  AuthService: {
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

describe('reset-password actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleRequestReset', () => {
    it('should successfully request password reset', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');

      vi.mocked(AuthService.requestPasswordReset).mockResolvedValue(true);

      const result = await handleRequestReset(formData);

      expect(AuthService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({ success: true });
    });

    it('should return error if email is missing', async () => {
      const formData = new FormData();
      const result = await handleRequestReset(formData);

      expect(result).toEqual({ error: 'Email is required' });
    });

    it('should return a friendly error if AuthService fails', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');

      vi.mocked(AuthService.requestPasswordReset).mockRejectedValue(new Error('Email failed'));

      const result = await handleRequestReset(formData);

      expect(result).toEqual({ error: 'Something went wrong. Please try again later.' });
    });
  });

  describe('handleResetPassword', () => {
    it('should successfully reset password', async () => {
      const formData = new FormData();
      formData.append('token', 'token123');
      formData.append('password', 'newpassword');
      formData.append('confirmPassword', 'newpassword');

      vi.mocked(AuthService.resetPassword).mockResolvedValue(true);

      const result = await handleResetPassword(formData);

      expect(AuthService.resetPassword).toHaveBeenCalledWith('token123', 'newpassword');
      expect(result).toEqual({ success: true });
    });

    it('should return error if token or password missing', async () => {
      const formData = new FormData();
      formData.append('token', 'token123');

      const result = await handleResetPassword(formData);

      expect(result).toEqual({ error: 'Token and password are required' });
    });

    it('should return error if passwords do not match', async () => {
      const formData = new FormData();
      formData.append('token', 'token123');
      formData.append('password', 'pass1');
      formData.append('confirmPassword', 'pass2');

      const result = await handleResetPassword(formData);

      expect(result).toEqual({ error: 'Passwords do not match' });
    });

    it('should return AuthService error if it fails', async () => {
      const formData = new FormData();
      formData.append('token', 'token123');
      formData.append('password', 'pass');
      formData.append('confirmPassword', 'pass');

      vi.mocked(AuthService.resetPassword).mockRejectedValue(new Error('Invalid token'));

      const result = await handleResetPassword(formData);

      expect(result).toEqual({ error: 'Invalid token' });
    });
  });
});
