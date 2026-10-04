const formatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currency = "BRL", locale = "pt-BR"): string {
  const key = `${locale}:${currency}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
    formatters.set(key, formatter);
  }
  return formatter.format(amount);
}
