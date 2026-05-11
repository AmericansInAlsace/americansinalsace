import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/services/AuthService';
import { SponsorshipService } from '@/services/SponsorshipService';

/**
 * Authorizes a user based on credentials. It's the core logic for the CredentialsProvider.
 * This function is called by NextAuth when a user attempts to sign in with credentials.
 * @param {Record<"email" | "password", string> | undefined} credentials - The email and password from the login form.
 * @returns {Promise<User | null>} The NextAuth user object if authentication is successful, otherwise null.
 * @throws {Error} If credentials are valid but the user's email is not verified, or on other unexpected errors.
 */
export async function authorize(credentials: Record<"email" | "password", string> | undefined) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  try {
    const user = await AuthService.verifyCredentials(credentials.email, credentials.password);
    
    if (!user) {
      return null;
    }

    // Map database user to NextAuth user
    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role?.name || 'USER',
      permissions: user.role?.permissions?.map(p => ({
        action: p.action,
        resource: p.resource,
      })) || [],
    } as User;
  } catch (error: any) {
    // Propagate the specific error (e.g. "Please verify your email") to the client
    throw new Error(error.message || 'Invalid credentials');
  }
}

/**
 * NextAuth configuration options.
 * Adheres to SOLID by delegating authentication logic to AuthService.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    /**
     * This callback is called whenever a JSON Web Token is created or updated.
     * It persists the user's ID, role, and permissions into the token.
     * @param {object} params - The parameters for the callback.
     * @param {JWT} params.token - The JWT token.
     * @param {User} params.user - The user object from the provider.
     * @returns {Promise<JWT>} The updated token.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as number;
        token.role = user.role;
        token.permissions = user.permissions;
      }

      // Check sponsorship status on every token update to keep it fresh
      if (token.id) {
        const activeSponsorship = await SponsorshipService.getActiveSponsorship(token.id);
        token.isSponsor = !!activeSponsorship;
        token.sponsorTier = activeSponsorship?.tier.name || null;
      }

      return token;
    },
    /**
     * This callback is called whenever a session is checked.
     * It enriches the session object with the data stored in the JWT token.
     * @param {object} params - The parameters for the callback.
     * @param {Session} params.session - The session object.
     * @param {JWT} params.token - The JWT token.
     * @returns {Promise<Session>} The updated session object.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.isSponsor = token.isSponsor;
        session.user.sponsorTier = token.sponsorTier;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev-only',
};
