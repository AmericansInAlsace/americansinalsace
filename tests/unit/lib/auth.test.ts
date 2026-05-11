import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions, authorize } from '@/lib/auth';
import { AuthService } from '@/services/AuthService';
import { SponsorshipService } from '@/services/SponsorshipService';

vi.mock('@/services/AuthService', () => ({
  AuthService: {
    verifyCredentials: vi.fn(),
  },
}));

vi.mock('@/services/SponsorshipService', () => ({
  SponsorshipService: {
    getActiveSponsorship: vi.fn(),
  },
}));

describe('lib/auth.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authorize function', () => {
    it('should return mapped user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: {
          name: 'ADMIN',
          permissions: [{ action: 'READ', resource: 'ALL' }]
        },
      };

      vi.mocked(AuthService.verifyCredentials).mockResolvedValue(mockUser as any);

      const result = await authorize({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(AuthService.verifyCredentials).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'John Doe',
        role: 'ADMIN',
        permissions: [{ action: 'READ', resource: 'ALL' }],
      });
    });

    it('should return null if credentials missing', async () => {
      const result = await authorize(undefined);
      expect(result).toBeNull();
    });

    it('should return null if AuthService returns null', async () => {
      vi.mocked(AuthService.verifyCredentials).mockResolvedValue(null);
      const result = await authorize({
        email: 'wrong@example.com',
        password: 'wrong'
      });
      expect(result).toBeNull();
    });
  });

  describe('callbacks', () => {
    it('jwt callback should add user info and sponsorship info to token', async () => {
      const token = { id: 1 };
      const user = { id: 1, role: 'ADMIN', permissions: [] };
      
      vi.mocked(SponsorshipService.getActiveSponsorship).mockResolvedValue({
        tier: { name: 'GOLD' }
      } as any);

      const result = await (authOptions.callbacks as any).jwt({ token, user });
      
      expect(SponsorshipService.getActiveSponsorship).toHaveBeenCalledWith(1);
      expect(result).toEqual(expect.objectContaining({
        id: 1,
        role: 'ADMIN',
        isSponsor: true,
        sponsorTier: 'GOLD'
      }));
    });

    it('jwt callback should not add sponsorship info if token.id is missing', async () => {
      const token = {};
      const result = await (authOptions.callbacks as any).jwt({ token });
      expect(SponsorshipService.getActiveSponsorship).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('session callback should not fail if session.user is missing', async () => {
      const session = {};
      const token = { id: 1 };
      const result = await (authOptions.callbacks as any).session({ session, token });
      expect(result).toEqual({});
    });

    it('session callback should add token info to session', async () => {
      const session = { user: { name: 'Test' } };
      const token = { id: 1, role: 'ADMIN', permissions: [], isSponsor: true, sponsorTier: 'GOLD' };
      const result = await (authOptions.callbacks as any).session({ session, token });
      expect(result.user.id).toBe(1);
      expect(result.user.role).toBe('ADMIN');
      expect(result.user.isSponsor).toBe(true);
      expect(result.user.sponsorTier).toBe('GOLD');
    });
  });
});
