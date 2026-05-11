import { NextResponse } from 'next/server';
import { LoggerService } from '@/services/LoggerService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API route for receiving client-side logs.
 */
export async function POST(request: Request) {
  try {
    const { level, message, details } = await request.json();
    const session = await getServerSession(authOptions);

    const enrichedDetails = {
      ...details,
      userId: session?.user?.id,
      userAgent: request.headers.get('user-agent'),
      url: request.headers.get('referer'),
    };

    switch (level) {
      case 'ERROR':
        await LoggerService.error('CLIENT', message, enrichedDetails);
        break;
      case 'WARN':
        await LoggerService.warn('CLIENT', message, enrichedDetails);
        break;
      case 'INFO':
        await LoggerService.info('CLIENT', message, enrichedDetails);
        break;
      default:
        await LoggerService.debug('CLIENT', message, enrichedDetails);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to record log' }, { status: 500 });
  }
}
