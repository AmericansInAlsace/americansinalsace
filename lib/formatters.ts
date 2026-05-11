/**
 * Formats a number or Decimal as a currency string according to the locale and configured currency.
 * 
 * @param value - The numerical value to format.
 * @param currency - Optional override for the currency code (defaults to NEXT_PUBLIC_CURRENCY or 'EUR').
 * @returns A formatted currency string.
 */
export function formatCurrency(value: number | any, currency?: string): string {
  const currencyCode = currency || process.env.NEXT_PUBLIC_CURRENCY || 'EUR';
  
  // Handle Decimal from Prisma or string/number
  const numValue = typeof value === 'object' && value !== null ? Number(value) : Number(value || 0);
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Formats a number to 2 decimal points without the currency symbol.
 * 
 * @param value - The numerical value to format.
 * @returns A string representation of the number with 2 decimal places.
 */
export function formatDecimal(value: number | any): string {
  const numValue = typeof value === 'object' && value !== null ? Number(value) : Number(value || 0);
  return numValue.toFixed(2);
}
