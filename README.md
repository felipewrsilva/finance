# Semeia

O tempo trabalha com o que você guarda.

Ferramentas em **português (Brasil)**. Sem cadastro. Três perguntas: um extra que vira investimento, para onde vai a renda, o que o tempo faz com um valor.

**Live:** [finance-seven-plum.vercel.app](https://finance-seven-plum.vercel.app)

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| i18n | next-intl v4, somente `pt-BR` |
| Math | Funções puras de projeção |
| Deployment | Vercel |

A UI pública não usa banco nem conta.

---

## Ferramentas

1. **Esse gasto:** um extra por mês virando investimento, e o que isso vira no tempo
2. **Renda:** a entrada do mês em quatro partes
3. **Tempo:** um valor agora, um pouco todo mês, e o horizonte

---

## Setup

**Prerequisites:** Node.js 20+

```bash
git clone https://github.com/felipewrsilva/finance.git
cd finance
npm install
npm run dev
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
