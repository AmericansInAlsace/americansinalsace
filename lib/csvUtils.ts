// lib/csvUtils.ts

import { Prisma } from '@/lib/generated/prisma';

/**
 * Converts an array of objects into a CSV string.
 * Assumes all objects have the same keys, and keys are ordered in the header.
 * Handles nested objects by stringifying them or using a specific key.
 *
 * @param data - Array of objects to convert.
 * @param headers - Optional array of header names. If not provided, object keys will be used.
 * @returns A CSV string.
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: (keyof T | string)[]
): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Determine headers: use provided headers or infer from the first object's keys.
  const objectKeys = Object.keys(data[0]) as (keyof T)[];
  const finalHeaders = headers || objectKeys;

  // Function to safely format cell content (handle commas, quotes, newlines)
  const formatCell = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    // Convert Prisma.Decimal to string
    if (value instanceof Prisma.Decimal) {
      value = value.toString();
    }
    // Convert Dates to ISO string
    if (value instanceof Date) {
      value = value.toISOString();
    }
    // Ensure value is a string
    let stringValue = String(value);

    // Escape quotes and wrap in quotes if necessary
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\\n')) {
      stringValue = `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Create header row
  const headerRow = finalHeaders.map(h => formatCell(h)).join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return finalHeaders.map(header => {
      // If header is a string and not directly a key of T, handle it (e.g., for nested properties)
      // For simplicity here, we assume headers are direct keys or can be accessed directly.
      // More complex nesting would require a more sophisticated lookup.
      const cellValue = typeof header === 'string' ? (row as any)[header] : row[header];
      return formatCell(cellValue);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\\n');
}

/**
 * Triggers a download of a CSV file.
 * This function is typically called from a client-side event handler.
 * For server-side generation, you'd return the CSV string from an API route/action
 * and handle the download in the client.
 *
 * @param filename - The desired name for the downloaded CSV file.
 * @param csvContent - The CSV string content.
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download) { // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Fallback for older browsers (less common now)
    alert('Your browser does not support downloading files directly. Please copy the CSV content manually.');
    console.log('CSV Content:', csvContent);
  }
}
