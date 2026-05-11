import { PrismaClient } from './generated/prisma_dev';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * Global Prisma client instance.
 * 
 * @description Provides a singleton instance of the PrismaClient using a driver adapter for Prisma 7 compatibility.
 */
const globalForPrisma = global as unknown as { [key: string]: any };

const connectionString = process.env.DATABASE_URL || '';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Using a versioned key forces a refresh of the singleton when we change this string
// Useful when schema changes aren't picked up by the cached singleton.
const PRISMA_SINGLETON_KEY = 'prisma_v3_logger';

const createPrismaClient = () => {
  const baseClient = new PrismaClient({ adapter });
  
  return baseClient.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        try {
          return await query(args);
        } catch (error: any) {
          if (model === 'SystemLog') throw error;

          (baseClient as any).systemLog.create({
            data: {
              level: 'ERROR',
              origin: 'DATABASE',
              message: `Error in ${model || 'raw'}.${operation}: ${error.message}`,
              details: { args },
            }
          }).catch(console.error);
          
          throw error;
        }
      },
    },
  });
};

export const prisma = globalForPrisma[PRISMA_SINGLETON_KEY] || createPrismaClient();
export const basePrisma = new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma[PRISMA_SINGLETON_KEY] = prisma;
