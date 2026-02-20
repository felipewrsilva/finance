# 🎯 Desktop DatePicker Must Match Mobile (Next.js + Tailwind v4)

Refactor the **Desktop DatePicker** so that it is visually identical to the **Mobile DatePicker**.

The mobile implementation is the single source of truth for layout and visual hierarchy.

---

## 🔒 Non-Negotiable Rules

* No hardcoded hex colors.
* No arbitrary pixel values outside the Tailwind scale.
* Preserve typography scale from the design system.
* Preserve spacing scale (`gap-*`, `p-*`, `space-*`).
* Preserve border radius and shadow tokens.
* Maintain strict TypeScript types (no `any`).

---

## 🧱 Structural Requirements

The Desktop component must replicate the **same DOM structure and hierarchy** as mobile.

### Header

* Small year displayed above.
* Large formatted date below.
* Same typography scale.
* Same spacing relationship.
* Same alignment.

### Month Navigation

* Icons aligned exactly as mobile.
* Same spacing and hit area.
* Same button structure.

### Calendar Grid

* 7-column grid (`grid-cols-7`).
* Identical gap between days.
* Same day cell size.
* Same selected-day emphasis (size, weight, background).
* Same hover + focus states.

### Footer Actions

* Clear, Cancel, Set
* Same layout and alignment.
* Same spacing between buttons.
* Same visual hierarchy.

---

## 🖥 Desktop Adjustments (Allowed)

You may adjust:

* Container width
* Modal max-width
* Responsive breakpoints

---

## 🧩 Implementation Rules (Tailwind v4 Specific)

* Use utility-first Tailwind classes.
* Use CSS variables from the theme (e.g. `bg-[var(--color-surface)]`).
* Do NOT introduce conflicting responsive overrides.
* Remove legacy desktop-specific hacks.
* Prefer refactoring over patching.
* Avoid duplicated layout wrappers.

If needed:

* Extract shared subcomponents to eliminate divergence between mobile and desktop.
* Ensure no conflicting conditional rendering changes layout structure.

---

## 🧠 Architecture Constraints (Next.js 16 App Router)

* Keep component as a Client Component only if necessary.
* Do not introduce unnecessary re-renders.
* Preserve current state management.
* Ensure no hydration mismatches.
* Maintain accessibility (ARIA roles, keyboard navigation).

---

## ✅ Expected Result

The Desktop DatePicker must be visually indistinguishable from the Mobile version in:

* Layout
* Proportion
* Spacing
* Hierarchy
* Interaction
* Grid structure

The ONLY acceptable difference is responsiveness to desktop viewport constraints — while fully preserving visual fidelity and theme tokens.
