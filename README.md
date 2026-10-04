# Finance

Ferramentas financeiras públicas em **português (Brasil)**. Projete investimentos, aloque renda e veja o impacto de redirecionar gastos. Sem cadastro e sem login.

**Live:** [finance-seven-plum.vercel.app](https://finance-seven-plum.vercel.app)

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| i18n | next-intl v4, somente `pt-BR` |
| Math | Funções puras de projeção (juros compostos) |
| Validation | Zod v4 |
| Deployment | Vercel |

Prisma/Neon permanecem no repositório para scripts internos, mas a UI pública **não** lê dados por usuário.

---

## Ferramentas

1. **Projeção de investimentos:** valor futuro com principal, taxa anual, aporte mensal e prazo
2. **Alocação 50/30/10/10:** divide a renda em custos fixos, conforto, metas e investimentos
3. **Redirecionar gastos:** compara o caminho atual com aportes extras investidos

---

## Setup

**Prerequisites:** Node.js 20+

```bash
git clone https://github.com/felipewrsilva/finance.git
cd finance
npm install
npm run dev
```

Opcional (só se for usar scripts Prisma/Neon):

```env
DATABASE_URL="your_neon_connection_string"
```

Abra [http://localhost:3000](http://localhost:3000) (redireciona para `/pt-BR`).

---

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Dev server |
| `npm run build` | Build de produção |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |

---

## Licença

Private.
