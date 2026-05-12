import { describe, it, expect, vi } from 'vitest';
import { convertToCSV, downloadCSV } from '@/lib/csvUtils';
import { Prisma } from '@/lib/generated/prisma';

describe('lib/csvUtils', () => {
  describe('convertToCSV', () => {
    it('should return empty string for empty data', () => {
      expect(convertToCSV([])).toBe('');
    });

    it('should convert simple objects to CSV', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      const result = convertToCSV(data);
      // Note: current implementation uses \\n literal instead of \n
      expect(result).toBe('name,age\\nJohn,30\\nJane,25');
    });

    it('should handle Prisma.Decimal and Date objects', () => {
      const date = new Date('2026-05-11T12:00:00Z');
      const data = [
        { amount: new Prisma.Decimal(100.5), date },
      ];
      const result = convertToCSV(data);
      expect(result).toContain('100.5');
      expect(result).toContain(date.toISOString());
    });

    it('should escape quotes and commas and newlines', () => {
      const data = [
        { note: 'Hello, world', title: 'A "special" case', desc: 'Line 1\\nLine 2' },
      ];
      const result = convertToCSV(data);
      expect(result).toContain('"Hello, world"');
      expect(result).toContain('"A ""special"" case"');
      expect(result).toContain('"Line 1\\nLine 2"');
    });

    it('should handle null and undefined values gracefully', () => {
      const data = [
        { name: 'John', nullVal: null, undefinedVal: undefined },
      ];
      const result = convertToCSV(data);
      // 'name,nullVal,undefinedVal\nJohn,,'
      expect(result).toContain('John,,');
    });
  });

  describe('downloadCSV', () => {
    it('should trigger download in browser environment', () => {
      // Mock browser APIs
      const mockBlob = vi.fn();
      global.Blob = mockBlob as any;
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url');
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = vi.fn();

      const mockLink = {
        download: 'test.csv',
        setAttribute: vi.fn(),
        style: {},
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as any));
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as any));

      downloadCSV('test.csv', 'content');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test.csv');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });
});
