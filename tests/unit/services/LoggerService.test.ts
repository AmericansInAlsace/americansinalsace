import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoggerService } from '@/services/LoggerService';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    systemLog: {
      create: vi.fn(),
    },
  },
}));

describe('LoggerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should log ERROR', async () => {
    await LoggerService.error('WEB', 'Test error', { id: 1 });
    expect(console.error).toHaveBeenCalled();
    expect(prisma.systemLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ level: 'ERROR', origin: 'WEB', message: 'Test error' })
    }));
  });

  it('should log WARN', async () => {
    await LoggerService.warn('DATABASE', 'Test warn');
    expect(console.warn).toHaveBeenCalled();
    expect(prisma.systemLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ level: 'WARN', origin: 'DATABASE', message: 'Test warn' })
    }));
  });

  it('should log INFO', async () => {
    await LoggerService.info('MAIL', 'Test info');
    expect(console.log).toHaveBeenCalled();
    expect(prisma.systemLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ level: 'INFO', origin: 'MAIL', message: 'Test info' })
    }));
  });

  it('should log DEBUG', async () => {
    await LoggerService.debug('CLIENT', 'Test debug');
    expect(console.log).toHaveBeenCalled();
    expect(prisma.systemLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ level: 'DEBUG', origin: 'CLIENT', message: 'Test debug' })
    }));
  });

  it('should handle DB errors gracefully', async () => {
    vi.mocked(prisma.systemLog.create).mockRejectedValue(new Error('DB failure'));
    
    // Should not throw, should just log to console.error
    await LoggerService.info('WEB', 'Test fallback');
    
    expect(console.error).toHaveBeenCalledWith('CRITICAL: Failed to persist system log to database:', expect.any(Error));
  });
});
