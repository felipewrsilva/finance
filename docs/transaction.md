Make Transactions page responsive & minimalist for desktop — keep system color tokens

Context: We have a working mobile layout that looks great. The desktop view is not responsive and feels cluttered. The goal is to make the desktop layout visually minimal, elegant, and with excellent UX while strictly using existing design system tokens for color/typography/shadows/spacings. Do not invent new colors outside the theme.

Primary goals:

1. Responsive layout across breakpoints (mobile/tablet/desktop/large desktop).


2. Minimal, elegant visual hierarchy that preserves mobile spacing and scale relationships.


3. Excellent usability: keyboard & screen-reader accessibility, clear focus states, touch-friendly hit areas where relevant.


4. Use design system tokens (CSS variables / theme tokens) for colors, fonts, radii, shadows and spacing — no hardcoded colors except tokens.



Breakpoints for the complete project:

mobile: 0 — 767px (keep existing)

tablet: 768 — 1023px

desktop: 1024 — 1439px

large: ≥1440px


Layout & visual rules:

Max content width: 1100–1280px centered on large screens. Use max-width container with automatic horizontal margins.

Keep mobile proportions as visual reference — scale up spacing and typography proportionally, not radically.

Top header: keep app header and right-aligned avatar/sign-out. Move the floating mobile +Add into a top-right primary CTA on desktop (aligned with header) with consistent padding.

Summary cards (Income / Expenses / Balance):

Display as a horizontal row on desktop with consistent gaps using grid or flex. Limit card width and keep rounded corners and shadows from tokens.

Typography scale up: heading small, currency larger and bold. Follow type scale tokens.


Month navigation:

Keep centered month title with left/right chevrons. Make chevrons keyboard & screen-reader operable.


Filters:

Convert stacked pill filters into a compact horizontal filter row on desktop. Use small subtle separators; active pill uses the system primary token.


Transactions list:

Use a single-column list with cards that span container width. Each item should be a semantic <article> or <li> and have: avatar/icon, title + subtitle (muted), amount (right aligned), action (Delete) as subtle secondary button aligned to the far right.

Keep sufficient whitespace and consistent vertical rhythm.


Bottom nav:

Hide mobile bottom nav on desktop; surface its key actions in header or as side navigation if present on other pages.


Modal/Dialog (Add transaction / DatePicker):

Center and size modals relative to viewport with max-width and use the system tokens for radii/shadow. On desktop increase padding and rearrange forms into 2 columns if beneficial, keeping field order and labels.



Interaction & UX:

Ensure keyboard navigation order is logical. Tab order: header → month nav → filters → list → footer controls.

Make all interactive elements focusable and show visible focus states (use outline from tokens).

Buttons: primary CTA (Add) prominent; secondary actions minimal and ghost style.

Hover & active states: subtle elevation or color shift using tokens.

Animations: small, performant transitions (150–250ms) for hover/focus and modal open/close. Prefer transform + opacity.

Loading & empty states: show skeleton loaders for list; show a minimal empty state card with CTA.

Touch targets: minimum 44–48px where clickable.

Accessibility: ARIA labels where needed, role="dialog" for modals, aria-current for active month/filter, ensure contrast ratios meet WCAG AA for normal text (>=4.5:1) and WCAG AA for large text (>=3:1).


CSS / implementation constraints (choose one stack or support multiple):

Prefer using design tokens via CSS variables (--color-primary, --space-4, etc.). If the codebase uses Tailwind, use the configured theme values rather than raw colors. If MUI/shadcn, use theme tokens.

Use CSS Grid for higher-level layout (summary cards, form columns) and Flexbox for rows (filters, list items).

Avoid component-specific !important or deep CSS overrides. Refactor styles into component-level classes or styled-components / Tailwind utility classes.

If legacy global styles conflict, add a scoped container.desktop class and prefer component-level styles.


Testing & deliverables:

Produce a small PR that includes:

Updated responsive CSS / component changes.

Storybook (or visual) snapshots for mobile/tablet/desktop for Transactions page.

Accessibility checks: list of ARIA attributes added and results from axe/lighthouse (basic).

Before/After screenshots for major breakpoints.

Short changelog in PR description with design decisions and tokens used.


Add unit or integration tests for:

Month nav keyboard interactions.

Focus order for Add modal.

Visibility of CTA and bottom nav behavior per breakpoint.



Acceptance criteria (must pass):

1. Desktop view is centered with max-width and looks minimal and elegant — summary cards, filters, list match mobile hierarchy but scaled.


2. No color changes outside theme tokens. Primary and secondary buttons follow system tokens.


3. Modal dialogs are centered and use system radii/shadow/padding tokens.


4. Keyboard navigation and focus states work and visible. Month nav and filters operable via keyboard and accessible by screen readers.


5. Bottom mobile nav hidden on desktop and primary actions accessible elsewhere.


6. PR includes before/after screenshots, storybook stories, and basic axe/lighthouse accessibility report.



Optional implementation tips for Copilot:

Provide sample CSS variable usage:
:root { --space-4: 16px; --radius-lg: 12px; --shadow-md: 0 6px 18px rgba(...); }

Example container:
.page-container { max-width: 1200px; margin: 0 auto; padding: var(--space-6); }

Use grid-template-columns: repeat(3, minmax(0, 1fr)); for summary cards on desktop, collapse to single column under 1024px.

For the transaction item layout: display: grid; grid-template-columns: auto 1fr auto; gap: var(--space-4); align-items: center;

Provide a Tailwind mapping example (if using Tailwind): @screen lg { .container { max-width: 1100px; } }.



---

Deliver the PR that follows the above and label it: feat(responsive): Transactions page — desktop & tablet UX polish.

If you want, I can now generate a shorter version targeted at a specific stack (Tailwind / MUI / shadcn / CSS Modules) — tell me which and I’ll produce a stack-specific prompt and a small starter CSS snippet.