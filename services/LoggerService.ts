import { basePrisma } from '@/lib/db';

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
type LogOrigin = 'WEB' | 'DATABASE' | 'MAIL' | 'CLIENT';

/**
 * LoggerService provides a centralized way to log system events to the database.
 * It also logs to the console for development and container logging.
 */
export class LoggerService {
  /**
   * Core logging method that persists to the database and console.
   */
  private static async log(level: LogLevel, origin: LogOrigin, message: string, details?: any) {
    // 1. Console logging for real-time monitoring
    const timestamp = new Date().toISOString();
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
    console[consoleMethod](`[${timestamp}] [${level}] [${origin}] ${message}`, details || '');

    // 2. Persistent logging to Database
    try {
      await (basePrisma as any).systemLog.create({
        data: {
          level,
          origin,
          message,
          details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        },
      });
    } catch (err) {
      // Fail-safe: if logging to the DB fails, we at least have the console log.
      console.error('CRITICAL: Failed to persist system log to database:', err);
    }
  }

  static async error(origin: LogOrigin, message: string, details?: any) {
    await this.log('ERROR', origin, message, details);
  }

  static async warn(origin: LogOrigin, message: string, details?: any) {
    await this.log('WARN', origin, message, details);
  }

  static async info(origin: LogOrigin, message: string, details?: any) {
    await this.log('INFO', origin, message, details);
  }

  static async debug(origin: LogOrigin, message: string, details?: any) {
    await this.log('DEBUG', origin, message, details);
  }
}
