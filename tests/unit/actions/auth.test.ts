import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRegister, handleLogin } from '@/app/actions/auth';
import { AuthService } from '@/services/AuthService';

vi.mock('@/services/AuthService', () => ({
  AuthService: {
    registerUser: vi.fn(),
  },
}));

describe('auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleRegister', () => {
    it('should successfully register a user', async () => {
      const formData = new FormData();
      formData.append('firstName', 'John');
      formData.append('lastName', 'Doe');
      formData.append('email', 'john@example.com');
      formData.append('password', 'password123');

      vi.mocked(AuthService.registerUser).mockResolvedValue({ id: 1, email: 'john@example.com' } as any);

      const result = await handleRegister(formData);

      expect(AuthService.registerUser).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result).toEqual({ success: true });
    });

    it('should return error if registration fails', async () => {
      const formData = new FormData();
      formData.append('email', 'john@example.com');

      vi.mocked(AuthService.registerUser).mockRejectedValue(new Error('Registration failed'));

      const result = await handleRegister(formData);

      expect(result).toEqual({ error: 'Registration failed' });
    });

    it('should return a generic error message if error has no message', async () => {
      const formData = new FormData();
      vi.mocked(AuthService.registerUser).mockRejectedValue({});

      const result = await handleRegister(formData);

      expect(result).toEqual({ error: 'Something went wrong during registration' });
    });
  });

  describe('handleLogin', () => {
    it('should return credentials if valid', async () => {
      const formData = new FormData();
      formData.append('email', 'john@example.com');
      formData.append('password', 'password123');

      const result = await handleLogin(formData);

      expect(result).toEqual({
        email: 'john@example.com',
        password: 'password123',
      });
    });

    it('should return error if email is missing', async () => {
      const formData = new FormData();
      formData.append('password', 'password123');

      const result = await handleLogin(formData);

      expect(result).toEqual({ error: 'Email and password are required' });
    });

    it('should return error if password is missing', async () => {
      const formData = new FormData();
      formData.append('email', 'john@example.com');

      const result = await handleLogin(formData);

      expect(result).toEqual({ error: 'Email and password are required' });
    });
  });
});
