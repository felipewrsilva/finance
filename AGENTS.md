# AGENTS

Public product: **pt-BR finance tools**, no login.

## Do

- Ship stateless calculators (projection, 50/30/10/10 allocation, redirect spend).
- Keep locale `pt-BR` only.
- Use everyday Portuguese and BRL. Modest defaults. Plain explanations.
- Redirect leftover `/login` and `/dashboard` paths to tools home.

## Do not

- Add Auth.js, OAuth, sessions, signup, or user accounts.
- Build a personal dashboard or per-user CRUD in the UI.
- Restore `en-US` or bilingual product copy.
- Name or segment users by income class in public copy.

Local agent notes live in `.agents/` (gitignored). Follow `.cursor/rules/product-tools.mdc`.
