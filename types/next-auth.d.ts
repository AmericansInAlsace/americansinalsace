import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      id: number;
      role: string;
      permissions: Array<{ action: string; resource: string }>;
      isSponsor: boolean;
      sponsorTier: string | null;
    } & DefaultSession["user"]
  }

  interface User {
    id: number;
    role: string;
    permissions: Array<{ action: string; resource: string }>;
    isSponsor: boolean;
    sponsorTier: string | null;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    id: number;
    role: string;
    permissions: Array<{ action: string; resource: string }>;
    isSponsor: boolean;
    sponsorTier: string | null;
  }
}
