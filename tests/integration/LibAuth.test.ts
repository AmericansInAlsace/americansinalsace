import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authorize, authOptions } from '@/lib/auth';
import { AuthService } from '@/services/AuthService';
import { SponsorshipService } from '@/services/SponsorshipService';

describe('Integration: Lib Auth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('authorize function', () => {
    it('should return null if no credentials are provided', async () => {
      const result = await authorize(undefined);
      expect(result).toBeNull();
    });

    it('should return null if credentials are incomplete', async () => {
      const result = await authorize({ email: 'test@example.com', password: '' });
      expect(result).toBeNull();
    });

    it('should return a NextAuth user object on successful verification', async () => {
      vi.spyOn(AuthService, 'verifyCredentials').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: {
          name: 'ADMIN',
          permissions: [{ action: 'READ', resource: 'ALL' }]
        }
      } as any);

      const result = await authorize({ email: 'test@example.com', password: 'password123' });
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.email).toBe('test@example.com');
      expect(result?.name).toBe('Test User');
      expect((result as any).role).toBe('ADMIN');
      expect((result as any).permissions[0].action).toBe('READ');
    });

    it('should return null if user is not found', async () => {
      vi.spyOn(AuthService, 'verifyCredentials').mockResolvedValue(null);
      const result = await authorize({ email: 'notfound@example.com', password: 'password123' });
      expect(result).toBeNull();
    });

    it('should throw an error if verification throws an error', async () => {
      vi.spyOn(AuthService, 'verifyCredentials').mockRejectedValue(new Error('Please verify your email'));
      
      await expect(authorize({ email: 'test@example.com', password: 'password123' }))
        .rejects
        .toThrow('Please verify your email');
    });
    
    it('should throw generic error if message is absent', async () => {
      vi.spyOn(AuthService, 'verifyCredentials').mockRejectedValue({});
      
      await expect(authorize({ email: 'test@example.com', password: 'password123' }))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('NextAuth Callbacks', () => {
    it('jwt callback should map user properties to token', async () => {
      const token = {};
      const user = {
        id: 1,
        role: 'ADMIN',
        permissions: [{ action: 'READ', resource: 'ALL' }]
      };

      vi.spyOn(SponsorshipService, 'getActiveSponsorship').mockResolvedValue(null);

      // @ts-ignore
      const result = await authOptions.callbacks!.jwt!({ token, user } as any);
      expect(result.id).toBe(1);
      expect(result.role).toBe('ADMIN');
      expect(result.permissions).toEqual(user.permissions);
    });

    it('jwt callback should add sponsorship info to token', async () => {
      const token = { id: 1 };
      
      vi.spyOn(SponsorshipService, 'getActiveSponsorship').mockResolvedValue({
        tier: { name: 'Gold Sponsor' }
      } as any);

      // @ts-ignore
      const result = await authOptions.callbacks!.jwt!({ token } as any);
      expect(result.isSponsor).toBe(true);
      expect(result.sponsorTier).toBe('Gold Sponsor');
    });

    it('session callback should map token properties to session user', async () => {
      const session = { user: {} };
      const token = {
        id: 1,
        role: 'ADMIN',
        permissions: [{ action: 'READ', resource: 'ALL' }],
        isSponsor: true,
        sponsorTier: 'Gold Sponsor'
      };

      // @ts-ignore
      const result = await authOptions.callbacks!.session!({ session, token } as any);
      expect(result.user.id).toBe(1);
      expect(result.user.role).toBe('ADMIN');
      expect(result.user.permissions).toEqual(token.permissions);
      expect(result.user.isSponsor).toBe(true);
      expect(result.user.sponsorTier).toBe('Gold Sponsor');
    });
    
    it('session callback should do nothing if no session user', async () => {
      const session = {};
      const token = { id: 1 };

      // @ts-ignore
      const result = await authOptions.callbacks!.session!({ session, token } as any);
      expect(result).toEqual(session);
    });
  });
});
