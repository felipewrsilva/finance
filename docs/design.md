## 🧠 Prompt: Make This UI Truly Responsive and Responsible

Improve the Overview and all related financial screens so they become **pixel-perfect responsive** and look **truly professional** on all devices (mobile, tablet, desktop).

The current overview breaks at various viewport widths:

* Income / Expenses / Net cards are cramped
* Text and icons overflow or shrink unpredictably
* Layout doesn’t adapt gracefully

We want a structural UI refactor, not simple CSS fixes.

---

### 🎯 Goals

**1. Professional Responsiveness**

* Layout adjusts smoothly through multiple breakpoints
* No element shrinking, truncating, or misaligning
* Grid adapts intelligently from mobile → tablet → desktop

**2. Visual Clarity & Hierarchy**

* Financial values (Total, Income, Expense, Net) must never compete visually
* Proper whitespace and consistent spacing rhythm
* Numbers should always be right-aligned
* Labels should be subtle and not overpower numeric values

**3. Shared Layout System**

* Implement standardized layout utility components
  e.g., `<ResponsiveContainer />`, `<SectionHeader />`, `<StatCard />`, `<ResponsiveGrid />`
* Avoid random Tailwind padding like `p-6` scattered everywhere

---

### 📐 Responsive Structure Rules

#### 📌 Overview Page

**Mobile**

```
Total Balance
Income
Expenses
Net
Spending by category
Recent transactions
Accounts
```

Use:

```
grid grid-cols-1 gap-4
```

**Tablet (sm+)**

```
Total Balance
Income | Expenses | Net (3-column)
Spending by category
Recent transactions
Accounts
```

Use:

```
grid sm:grid-cols-3 gap-6
```

**Desktop (lg+)**

```
Total Balance (hero left)
Income | Expenses | Net (hero right)
Spending | Recent transactions | Accounts (below)
```

Use:

```
grid lg:grid-cols-3 gap-8
```

All numeric values must scale text size responsively:

```
text-2xl → sm:text-3xl → lg:text-4xl
font-bold tracking-tight tabular-nums
```

---

### 📊 Transactions List

**Mobile**

* No table grid → vertical stack
* Each row:

  * Date
  * Category + account (subtitle)
  * Amount (right-aligned, color coded)

**Tablet+**

* Two-column grid
* Amount always right-aligned

**Desktop**

* Full grid with columns:

  * Date | Category | Account | Amount
* Responsive spacing
* No horizontal scroll

---

### 🏦 Accounts Page

* Icon + name + balance
* Balance always visible
* Use:

```
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
```

* No overflow on longer names

---

## 🧱 Global Tailwind Rules (Strict)

* Use design tokens only (`var(--color-*)`)
* No arbitrary utility classes outside design scale
* No nested cards without consistent margin rhythm
* Maintain consistent:

  * `rounded-lg`
  * `shadow-sm`
  * `space-y-* / space-x-*`

Use responsive utilities:

```
sm:
md:
lg:
xl:
```

Do not use unscoped breakpoints.

---

## ⚡ Responsive Interaction Behavior

* Buttons and CTAs must scale hit area:

```
h-12 w-full sm:w-auto
```

* Font sizes of labels vs numbers:

```
label: text-sm / subtle text color
values: text-xl → sm:text-2xl → lg:text-3xl
```

---

## 🧪 Cross-Viewport QA Checklist

The screens must look good at:

✔ 320px
✔ 375px
✔ 425px
✔ 768px
✔ 1024px
✔ 1280px
✔ 1440px

At every width:

* No clipping
* No overlapping
* No truncation unless text length exceeds container
* Maintain visual hierarchy

---

## 🏁 Expected Professional Outcome

After implementing this:

* UI feels intentional, not patched
* Responsive design is structural, not cosmetic
* Numbers and financial data scale elegantly
* Layout adapts fluidly across breakpoints
* Visual rhythm and spacing feel modern and consistent

This is not a quick fix.
This is a full responsive rework to professional standard.
