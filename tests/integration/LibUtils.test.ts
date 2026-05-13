import { describe, it, expect } from 'vitest';
import { convertToCSV } from '@/lib/csvUtils';
import { formatCurrency, formatDecimal } from '@/lib/formatters';
import { Prisma } from '@/lib/generated/prisma';

describe('Integration: Lib Utils', () => {
  describe('csvUtils: convertToCSV', () => {
    it('should convert an array of objects to CSV', () => {
      const data = [
        { id: 1, name: 'John Doe', amount: new Prisma.Decimal(10.5), date: new Date('2026-05-13T10:00:00Z') },
        { id: 2, name: 'Jane, Doe', amount: 20, date: null }
      ];
      const csv = convertToCSV(data);
      expect(csv).toContain('id,name,amount,date');
      expect(csv).toContain('1,John Doe,10.5,2026-05-13T10:00:00.000Z');
      expect(csv).toContain('2,"Jane, Doe",20,');
    });

    it('should return empty string if no data', () => {
      expect(convertToCSV([])).toBe('');
    });

    it('should use provided headers', () => {
        const data = [{ a: 1, b: 2 }];
        const csv = convertToCSV(data, ['a']);
        expect(csv).toBe('a\\n1');
    });
  });

  describe('formatters', () => {
    it('should format currency correctly', () => {
        expect(formatCurrency(10.5, 'EUR')).toContain('10.50');
        expect(formatCurrency(new Prisma.Decimal(20))).toContain('20.00');
        expect(formatCurrency(0)).toContain('0.00');
    });

    it('should format decimal correctly', () => {
        expect(formatDecimal(10.5)).toBe('10.50');
        expect(formatDecimal(new Prisma.Decimal(20))).toBe('20.00');
        expect(formatDecimal(null)).toBe('0.00');
    });
  });
});
