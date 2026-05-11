'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Fetches system logs with filtering and pagination.
 */
export async function getSystemLogs(params: {
  page?: number;
  pageSize?: number;
  level?: string;
  origin?: string;
  search?: string;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const { page = 1, pageSize = 50, level, origin, search } = params;

  const where = {
    ...(level && level !== 'ALL' && { level }),
    ...(origin && origin !== 'ALL' && { origin }),
    ...(search && {
      OR: [
        { message: { contains: search, mode: 'insensitive' as any } },
        { origin: { contains: search, mode: 'insensitive' as any } },
      ],
    }),
  };

  const [logs, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.systemLog.count({ where }),
  ]);

  return { logs, total, page, pageSize };
}

/**
 * Aggregates daily error and warning counts for the last 14 days.
 */
export async function getLogStats() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const logs = await prisma.systemLog.findMany({
    where: {
      timestamp: { gte: fourteenDaysAgo },
      level: { in: ['ERROR', 'WARN'] },
    },
    select: {
      level: true,
      timestamp: true,
    },
  });

  // Group by day and level
  const statsMap: Record<string, { date: string; errors: number; warnings: number }> = {};

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    statsMap[dateStr] = { date: dateStr, errors: 0, warnings: 0 };
  }

  logs.forEach(log => {
    const dateStr = log.timestamp.toISOString().split('T')[0];
    if (statsMap[dateStr]) {
      if (log.level === 'ERROR') statsMap[dateStr].errors++;
      else if (log.level === 'WARN') statsMap[dateStr].warnings++;
    }
  });

  return Object.values(statsMap).sort((a, b) => a.date.localeCompare(b.date));
}
