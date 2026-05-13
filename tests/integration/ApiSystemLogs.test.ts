import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/system/logs/route';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { getServerSession } from 'next-auth';

vi.mock('next-auth');

describe('Integration: API System Logs', () => {
  beforeEach(async () => {
    await IntegrationTestHelper.clearDatabase();
    vi.clearAllMocks();
  });

  it('should record an error log from the client', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1 } } as any);

    const logData = {
      level: 'ERROR',
      message: 'Client-side error',
      details: { foo: 'bar' },
    };

    const request = new Request('http://localhost/api/system/logs', {
      method: 'POST',
      body: JSON.stringify(logData),
      headers: {
        'user-agent': 'test-agent',
        'referer': 'http://localhost/page',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify DB state
    const log = await prisma.systemLog.findFirst({
      where: { level: 'ERROR', origin: 'CLIENT' },
    });
    expect(log).toBeDefined();
    expect(log?.message).toBe('Client-side error');
    expect((log?.details as any).userId).toBe(1);
    expect((log?.details as any).userAgent).toBe('test-agent');
  });

  it('should record a warn log from the client', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const logData = { level: 'WARN', message: 'Warn message' };
    const request = new Request('http://localhost/api/system/logs', { method: 'POST', body: JSON.stringify(logData) });
    const response = await POST(request);
    expect(response.status).toBe(200);

    const log = await prisma.systemLog.findFirst({ where: { level: 'WARN', origin: 'CLIENT' } });
    expect(log).toBeDefined();
    expect(log?.message).toBe('Warn message');
  });

  it('should record an info log from the client', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const logData = { level: 'INFO', message: 'Info message' };
    const request = new Request('http://localhost/api/system/logs', { method: 'POST', body: JSON.stringify(logData) });
    const response = await POST(request);
    expect(response.status).toBe(200);

    const log = await prisma.systemLog.findFirst({ where: { level: 'INFO', origin: 'CLIENT' } });
    expect(log).toBeDefined();
  });

  it('should record a debug log by default', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const logData = { level: 'UNKNOWN', message: 'Unknown message' };
    const request = new Request('http://localhost/api/system/logs', { method: 'POST', body: JSON.stringify(logData) });
    const response = await POST(request);
    expect(response.status).toBe(200);

    const log = await prisma.systemLog.findFirst({ where: { level: 'DEBUG', origin: 'CLIENT' } });
    expect(log).toBeDefined();
  });

  it('should return 500 if log data is invalid', async () => {
    const request = new Request('http://localhost/api/system/logs', {
      method: 'POST',
      body: 'invalid-json',
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
