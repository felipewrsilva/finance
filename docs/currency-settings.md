Send this to Copilot:

---

Refactor the **Currency Settings** screen completely.

Goal:
Turn it into a minimal, elegant, low-friction configuration screen.
Right now it feels heavy, redundant, and overly administrative.

This should feel like a quick preference setting — not a management panel.

---

# 🎯 UX Goal

* Zero friction
* No redundancy
* No nested cards inside cards
* Clean hierarchy
* Instant interactions (no “Save” buttons)
* Mobile-first
* Premium financial app aesthetic

---

# 🧠 Correct Mental Model

Currency settings are simple:

* One default currency
* A small list of enabled currencies

This is just a lightweight CRUD with a “Make default” action.

Nothing more.

---

# ❌ Current Problems

* Two separate cards → unnecessary separation
* “Save” button → redundant
* Dropdown to change default → friction
* Too much explanatory text
* Excess padding
* Looks like an enterprise admin panel

---

# ✅ New UX Model

## Structure

Page title:

Currency

Optional subtle subtitle (1 short line max).

Below that:

A simple vertical list of enabled currencies.

No multiple sections.
No large form blocks.

---

# 🧱 Layout Proposal

Simple list layout:

---

## 🇧🇷 Brazilian Real (BRL)   Default

## 🇺🇸 US Dollar (USD)       Make default   Remove

* Add currency

That’s it.

---

# 🔁 Interactions

## 1️⃣ Make Default

* Clicking “Make default”:

  * Updates instantly (optimistic UI)
  * No Save button
  * Default badge moves immediately
* No dropdown for default selection
* No page reload

---

## 2️⃣ Remove

* Cannot remove the default currency
* Cannot remove the last remaining currency
* Use inline confirmation (not heavy modal)
* Keep it subtle

---

## 3️⃣ Add Currency

Replace the current “dropdown + Add button” with:

A simple:

* Add currency

When clicked:

* Inline dropdown appears below
* Selecting a currency adds it immediately
* No extra confirmation button

Keep it minimal.

---

# 🎨 Visual Style

* No heavy cards
* No excessive shadows
* Clean vertical spacing
* Subtle separators
* Small, minimal “Default” badge
* “Make default” should look like a light secondary action

Avoid:

* Large primary buttons
* Bright dominant CTAs
* Administrative UI patterns

---

# 📱 Mobile-First Requirements

* Full-width rows
* Entire row is tappable
* Actions aligned to the right
* No long descriptive text
* Compact vertical spacing

Should feel like a native mobile settings screen.

---

# 🧩 Component Structure

Create:

`<CurrencyList />`
`<CurrencyRow />`

CurrencyRow props:

```ts
{
  code: string
  name: string
  isDefault: boolean
  onMakeDefault: () => void
  onRemove: () => void
}
```

Keep logic centralized.
Avoid duplicated state.

---

# 🧠 System Rules

* defaultCurrency must always exist
* enabledCurrencies must always include defaultCurrency
* Prevent inconsistent states
* Immediate persistence on action (no Save step)

---

# 🧼 Microcopy

Remove:

* “Used for dashboard totals…”
* “These appear as options…”
* Any obvious explanatory text

Currency is self-explanatory.

---

# 🏁 Expected Result

The screen should feel:

* Lightweight
* Elegant
* Fast
* Clear
* Modern
* Frictionless
* Minimal

If it feels like an admin panel, it’s wrong.

Refactor structurally, not just visually.
