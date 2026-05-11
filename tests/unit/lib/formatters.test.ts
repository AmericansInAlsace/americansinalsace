import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDecimal } from '@/lib/formatters';

describe('lib/formatters', () => {
  describe('formatCurrency', () => {
    it('should format numbers correctly', () => {
      expect(formatCurrency(10.5)).toContain('10.50');
    });

    it('should handle custom currency', () => {
      expect(formatCurrency(10, 'USD')).toContain('$'); // Will contain the USD symbol
    });

    it('should handle falsy values', () => {
      expect(formatCurrency(null)).toContain('0.00');
      expect(formatCurrency(undefined)).toContain('0.00');
    });
  });

  describe('formatDecimal', () => {
    it('should format numbers to 2 decimal places', () => {
      expect(formatDecimal(10.5)).toBe('10.50');
      expect(formatDecimal(10)).toBe('10.00');
    });

    it('should handle falsy values', () => {
      expect(formatDecimal(null)).toBe('0.00');
      expect(formatDecimal(undefined)).toBe('0.00');
    });
  });
});
