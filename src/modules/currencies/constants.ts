export const SUPPORTED_CURRENCIES = [
  { code: "BRL", label: "Real Brasileiro (BRL)" },
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "ARS", label: "Peso Argentino (ARS)" },
  { code: "JPY", label: "Japanese Yen (JPY)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "CHF", label: "Swiss Franc (CHF)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
  { code: "MXN", label: "Mexican Peso (MXN)" },
  { code: "CLP", label: "Chilean Peso (CLP)" },
  { code: "COP", label: "Colombian Peso (COP)" },
  { code: "PEN", label: "Peruvian Sol (PEN)" },
  { code: "UYU", label: "Uruguayan Peso (UYU)" },
] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];
