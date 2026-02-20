export const SUPPORTED_CURRENCIES = [
  { code: "BRL", flag: "🇧🇷", name: "Brazilian Real",     label: "Brazilian Real (BRL)" },
  { code: "USD", flag: "🇺🇸", name: "US Dollar",          label: "US Dollar (USD)" },
  { code: "EUR", flag: "🇪🇺", name: "Euro",               label: "Euro (EUR)" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound",      label: "British Pound (GBP)" },
  { code: "ARS", flag: "🇦🇷", name: "Argentine Peso",     label: "Argentine Peso (ARS)" },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen",       label: "Japanese Yen (JPY)" },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar",    label: "Canadian Dollar (CAD)" },
  { code: "CHF", flag: "🇨🇭", name: "Swiss Franc",        label: "Swiss Franc (CHF)" },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar",  label: "Australian Dollar (AUD)" },
  { code: "MXN", flag: "🇲🇽", name: "Mexican Peso",       label: "Mexican Peso (MXN)" },
  { code: "CLP", flag: "🇨🇱", name: "Chilean Peso",       label: "Chilean Peso (CLP)" },
  { code: "COP", flag: "🇨🇴", name: "Colombian Peso",     label: "Colombian Peso (COP)" },
  { code: "PEN", flag: "🇵🇪", name: "Peruvian Sol",       label: "Peruvian Sol (PEN)" },
  { code: "UYU", flag: "🇺🇾", name: "Uruguayan Peso",     label: "Uruguayan Peso (UYU)" },
] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];
