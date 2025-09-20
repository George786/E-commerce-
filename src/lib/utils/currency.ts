/**
 * Formats a number as USD currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$12.99")
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats a number as USD currency without the dollar sign
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "12.99")
 */
export function formatUSDNoSymbol(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Converts cents to dollars and formats as USD
 * @param cents - The amount in cents
 * @returns Formatted currency string (e.g., "$12.99")
 */
export function formatCentsToUSD(cents: number): string {
  return formatUSD(cents / 100)
}
