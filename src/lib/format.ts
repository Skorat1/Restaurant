/**
 * Standard Indian Rupee (INR ₹) Currency Formatter
 * Ensures uniform price formatting across the entire VELORA portal.
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "₹0";
  }
  const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
}

export function formatPriceWithDecimals(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "₹0.00";
  }
  const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
