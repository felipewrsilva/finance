# 🎯 Upgrade DatePicker to Professional-Grade (Month + Year Navigation)

Refactor the custom `date-picker.tsx` to behave like a professional financial product (Stripe, Notion, Linear, Apple, modern banking apps).

Current issue:

* You can only navigate months.
* Year navigation is limited and not ergonomic.
* The interaction does not feel “enterprise-grade”.

We need full month + year navigation with smooth UX and clean hierarchy.

---

# 🔥 Target UX (Professional Pattern)

The DatePicker must support:

### 1️⃣ Month Navigation

* Left / right arrows navigate months.
* Smooth state transition.
* Maintain current selected day when possible.

### 2️⃣ Year Navigation (Required Upgrade)

Implement one of these professional patterns:

### Preferred Pattern (Best UX)

Header becomes interactive:

Current structure:
Small year
Large date

New behavior:

* Clicking the year switches to “Year Selection Mode”.
* Displays a scrollable grid/list of years (e.g., 2000–2035).
* Selecting a year returns to month view.
* Month remains selected.
* Day preserved if valid.

This is how modern SaaS products do it.

---

# 🧠 Interaction Modes

### Mode 1 — Day View (default)

* Shows month grid.
* Standard 7-column layout.
* Current selected date highlighted.

### Mode 2 — Year View

* Grid of years (3–4 columns).
* Scrollable container.
* Current year highlighted.
* Selected year highlighted.
* Clicking year returns to month view.

Optional (advanced):
Mode 3 — Month Selection view (year + 12 months grid)

---

# 🧱 Structural Requirements (Tailwind v4)

* No hardcoded hex colors.
* Use CSS variables from design system.
* Preserve spacing scale.
* Preserve border radius tokens.
* Preserve shadow tokens.
* Maintain strict TypeScript.

---

# 🧩 Component Architecture

Refactor `date-picker.tsx`:

Use explicit state:

```ts
type ViewMode = "day" | "year"
```

State:

```ts
const [viewMode, setViewMode] = useState<ViewMode>("day")
const [displayedMonth, setDisplayedMonth] = useState<Date>()
```

Never mutate selected date directly when navigating.

---

# 📅 Year Grid Implementation

* Range: currentYear - 50 → currentYear + 20
* Scroll to current year on open.
* Highlight:

  * Today’s year
  * Selected date year
* Use Tailwind grid layout.
* Ensure keyboard navigation works.

---

# 🎯 Accessibility (Professional Standard)

* ARIA roles for grid and gridcell.
* Arrow key navigation.
* Enter to select.
* Escape closes.
* Focus trapping inside modal.
* No hydration mismatch.

---

# 🖥 Desktop + Mobile Consistency

* Keep layout identical.
* Year selection must not feel like a separate page.
* Smooth transition (opacity/scale) optional.
* Do not break mobile behavior.

---

# 🧼 Visual Hierarchy Improvements

Header:

Small year (muted)
Large formatted date (bold)
Clickable year indicator (cursor-pointer)
Subtle hover state

Month navigation:

Centered month label
Arrows balanced left/right

Selected day:

Strong but not aggressive
Consistent with theme tokens

---

# ⚡ Performance

* Avoid recalculating month grid unnecessarily.
* Memoize computed days.
* Avoid recreating date objects excessively.
* No unnecessary re-renders.

---

# 🧠 Financial App Standard

This is a finance application.

The DatePicker must feel:

* Precise
* Intentional
* Predictable
* Stable
* Enterprise-grade
* Not playful
* Not Material default

No bouncing animations.
No playful transitions.
Minimal, serious.

---

# ✅ Expected Result

After refactor:

* User can navigate month-by-month.
* User can jump years instantly.
* UX feels like Stripe / banking dashboards.
* No layout inconsistencies.
* Clean Tailwind structure.
* Strict TypeScript.
* No regressions in mobile.

Refactor structurally if necessary.
Do not patch the existing code with small adjustments.
