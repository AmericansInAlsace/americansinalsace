import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * Global Prisma client instance.
 * 
 * @description Provides a singleton instance of the PrismaClient using a driver adapter for Prisma 7 compatibility.
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Executes a raw SQL query.
 * 
 * @description Executes a raw SQL query string using the Prisma client.
 * @deprecated Use the standard prisma client methods (e.g., prisma.user.findMany()) for type-safety and security.
 * @param {string} text - The raw SQL query string.
 * @param {any[]} [params] - Optional parameters for the query.
 * @returns {Promise<T[]>} A promise that resolves to the query results.
 */
export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  // @ts-ignore - raw query shim
  return prisma.$queryRawUnsafe<T[]>(text, ...(params || []));
}
