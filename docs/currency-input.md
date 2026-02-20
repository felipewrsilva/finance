All input fields that represent monetary values must behave as proper currency inputs.

This is not just formatting on blur. It must be a controlled currency input component.

---

# 1. Create a Reusable `<CurrencyInput />` Component

Requirements:

* Controlled component
* Accepts:

  * `value: number`
  * `currency: string`
  * `locale: string`
  * `onChange: (value: number) => void`
* Internally handles:

  * Masking
  * Formatting
  * Parsing back to numeric value
* Stores numeric value only (no formatted strings in state)

---

# 2. Formatting Behavior

While typing:

* Input should format live as currency.
* Respect locale:

  * pt-BR → `1.234,56`
  * en-US → `1,234.56`
* Show currency symbol.
* Prevent invalid characters.
* Handle backspace correctly.
* Keep caret position stable.

Do NOT:

* Break typing flow
* Force cursor jump to end
* Allow multiple decimal separators

---

# 3. Decimal Rules

* Always 2 decimal places for standard currencies.
* Allow only numeric input.
* Negative values only if explicitly allowed (e.g., adjustments).

---

# 4. UX Rules

* If only 1 currency → symbol fixed.
* If multiple currencies enabled:

  * Currency selector appears inline (minimal dropdown).
  * Changing currency re-renders formatting.

Layout:

[ R$ 1.234,56   ▼ ]

Minimal, compact, mobile-friendly.

---

# 5. Data Handling

The component must:

* Emit raw numeric value (e.g., 1234.56)
* Never emit formatted string
* Never rely on string parsing at submission time
* Keep formatting logic isolated

---

# 6. Refactor All Money Inputs

Replace every:

* amount input in TransactionForm
* recurring amount input
* any adjustment input
* any transfer input

with `<CurrencyInput />`.

No plain `<input type="number">` allowed for money.

---

# 7. Centralize Formatting Logic

Create utility:

```ts
formatCurrency(amount: number, currency: string, locale: string)
```

CurrencyInput should reuse this.

No duplicated Intl.NumberFormat calls.

---

# 8. Edge Cases

Handle:

* Empty value
* Zero
* Large numbers
* Pasting values
* Switching currency mid-edit
* Mobile numeric keyboard support

Use `inputMode="decimal"` for mobile.

---

# 9. Performance

* Avoid re-creating Intl.NumberFormat on every render.
* Memoize formatter per (currency, locale).
* Avoid unnecessary re-renders.

---

# 10. Goal

* Every monetary field behaves like a professional financial app.
* Clean.
* Predictable.
* Locale-aware.
* Multi-currency ready.
* No hacks.
* No inconsistent formatting anywhere.

Refactor properly. Do not patch individual inputs.
