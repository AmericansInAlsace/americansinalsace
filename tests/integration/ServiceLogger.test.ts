import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoggerService } from '@/services/LoggerService';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';

describe('LoggerService Integration', () => {
  beforeEach(async () => {
    await IntegrationTestHelper.clearDatabase();
  });

  it('should log an error message', async () => {
    await LoggerService.error('WEB', 'Test error', { foo: 'bar' });
    
    const logs = await prisma.systemLog.findMany();
    expect(logs.length).toBe(1);
    expect(logs[0].level).toBe('ERROR');
    expect(logs[0].origin).toBe('WEB');
    expect(logs[0].message).toBe('Test error');
    expect(logs[0].details).toEqual({ foo: 'bar' });
  });

  it('should log a warning message', async () => {
    await LoggerService.warn('DATABASE', 'Test warn');
    
    const logs = await prisma.systemLog.findMany();
    expect(logs.length).toBe(1);
    expect(logs[0].level).toBe('WARN');
    expect(logs[0].origin).toBe('DATABASE');
  });

  it('should log an info message', async () => {
    await LoggerService.info('MAIL', 'Test info');
    
    const logs = await prisma.systemLog.findMany();
    expect(logs.length).toBe(1);
    expect(logs[0].level).toBe('INFO');
  });

  it('should log a debug message', async () => {
    await LoggerService.debug('CLIENT', 'Test debug');
    
    const logs = await prisma.systemLog.findMany();
    expect(logs.length).toBe(1);
    expect(logs[0].level).toBe('DEBUG');
  });

  it('should not crash if database logging fails', async () => {
    // Force database error by mocking prisma.systemLog.create
    // We use basePrisma in LoggerService, so we mock it
    const { basePrisma } = await import('@/lib/db');
    const spy = vi.spyOn(basePrisma.systemLog, 'create').mockRejectedValue(new Error('DB Error'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await LoggerService.error('WEB', 'This should not crash');
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('CRITICAL: Failed to persist system log to database:'), expect.any(Error));
    
    spy.mockRestore();
    consoleSpy.mockRestore();
  });
});
