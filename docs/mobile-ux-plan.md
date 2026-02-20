# Mobile UX Review — Plano de execução

> Data: 20/02/2026

---

## 1. Diagnóstico geral

O app tem uma base sólida mas foi construído desktop-first e adaptado. Os problemas são sistêmicos: formulários burocráticos, moeda hardcoded como USD em dois lugares (bug real), interações redundantes e textos genéricos que deveriam ser contextuais. A integração "Recurring como seção separada" é o maior problema estrutural de UX.

---

## 2. Problemas encontrados

### 🔴 Bugs críticos

| Arquivo | Problema |
|---|---|
| `src/app/dashboard/transactions/page.tsx` | Moeda hardcoded `"USD"` — ignora a currency do usuário |
| `src/components/transactions/transaction-list.tsx` | Mesmo problema: `"en-US" / "USD"` hardcoded |

### 🟠 Alta fricção

- **TransactionForm**: `<select>` para Expense/Income — campo mais usado, tem só 2 opções, deveria ser toggle visual
- **RecurringForm**: mesmo select de tipo + não tem lógica de conta única (só TransactionForm foi corrigido)
- **Recurring como seção separada**: exige navegação, tem página própria, bottom nav separada — viola o princípio mobile-first
- **TransactionList**: Edit + Delete sempre visíveis em cada linha → 2 botões pequenos em mobile, área de toque inadequada

### 🟡 Média fricção

- **Dashboard — `grid-cols-3`**: em 360px os valores de Income/Expenses/Net ficam truncados
- **Dashboard — microcopy `"Across 1 account"`**: quando há só 1 conta deve mostrar o nome dela diretamente
- **Dashboard — `"Here's your financial overview for..."`**: frase longa sem valor informacional
- **TransactionFilters**: 5 `<select>` em linha quebram no mobile; filtro de conta desnecessário quando há só 1
- **New transaction page**: card com `p-6` + `rounded-xl` + h1 desperdiçam espaço em mobile antes do primeiro campo

### 🟢 Baixa fricção (polish)

- `"Recurring"` no bottom nav ocupa espaço que pode ser melhor usado
- Botão "⚡ Generate pending transactions" é ação manual que deveria ser automática ou inline
- `"Manage →"` e `"View all →"` aparecem 3× no dashboard — excesso de CTAs secundários

---

## 3. Propostas por categoria

### Layout

- **Summary cards (3 colunas)** → `grid-cols-1` no mobile com layout horizontal compacto (label + valor lado a lado). No `sm+` mantém grid de 3.
- **New transaction** → remover o card wrapper no mobile, usar tela inteira com padding simples
- **Transaction list** → cada item é uma linha navegável (tap → edit), sem botões sempre visíveis

### Componentes

- **TypeToggle**: `<button>Expense</button> <button>Income</button>` — aplicar em TransactionForm e RecurringForm
- **Recurring toggle**: dentro do TransactionForm, um checkbox "Repeat this transaction". Ao ativar, expande: Frequency + End date
- **TransactionList item**: tap na linha inteira → `/edit`. Delete com estado local `confirmingId` — sem `window.confirm()`
- **TransactionFilters**: mês/ano como chips navegáveis `← Fev 2026 →`, tipo como dois chips, conta só aparece se houver 2+

### Fluxos

- **Recurring integrado no TransactionForm**: a action `createTransaction` verifica `isRecurring` e cria um `RecurringRule` automaticamente além da transação
- **Remover `Recurring` do bottom nav**: manter a página `/recurring` como "histórico de regras" acessível por outro caminho (ex: Settings)
- **Delete com confirm inline**: substituir `window.confirm()` por estado local `confirmingId` — botão vira "Confirmar?" por 3s

### Microcopy

| Antes | Depois |
|---|---|
| `"Across 1 account"` | Nome da conta diretamente, ex: `"Nubank"` |
| `"Across N accounts"` | `"N accounts"` |
| `"Here's your financial overview for February 2026."` | Remover — o card de saldo já comunica isso |
| `"Automate your regular income & expenses."` | Remover — contexto óbvio |
| `"Select an account"` | Hidden se 1 conta (já implementado no TransactionForm) |
| `"Select a category"` | Pré-selecionar a mais usada no tipo |

---

## 4. Plano de execução — priorizado

### Etapa 1 — Bug fix + quick wins
> Sem risco, sem refactor. Execução imediata.

- [ ] Corrigir moeda USD hardcoded em `transactions/page.tsx` e `transaction-list.tsx`
- [ ] Corrigir microcopy `"Across N accounts"` no dashboard
- [ ] Remover subtítulo `"Here's your financial overview..."` do dashboard
- [ ] Aplicar lógica de conta única no `RecurringForm` (já feito no TransactionForm)

### Etapa 2 — Type toggle
> Alto impacto visual, baixo risco.

- [ ] Criar componente `<TypeToggle>` reutilizável (Expense / Income)
- [ ] Substituir `<select name="type">` no `TransactionForm`
- [ ] Substituir `<select name="type">` no `RecurringForm`

### Etapa 3 — Transaction list + filters
> Melhora direta de usabilidade mobile.

- [ ] Transformar cada item em link clicável na linha inteira (tap → edit)
- [ ] Delete: estado local `confirmingId`, sem janela de diálogo nativa
- [ ] Filtros: `← Mês →` chips de navegação; tipo como dois chips; esconder conta se 1

### Etapa 4 — Dashboard mobile
> Ajustes de layout e microcopy.

- [ ] Summary cards: `grid-cols-1 sm:grid-cols-3` com layout horizontal no mobile
- [ ] Remover CTAs secundários redundantes (manter só 1 `"View all →"` por seção)

### Etapa 5 — Recurring integrado
> Mudança estrutural. Maior esforço, maior impacto.

- [ ] Adicionar campos `isRecurring`, `frequency`, `recurrenceEnd` ao `transactionSchema`
- [ ] Expandir `createTransaction` action para criar `RecurringRule` se `isRecurring=true`
- [ ] Adicionar toggle + campos expansíveis no `TransactionForm`
- [ ] Remover `"Recurring"` do bottom nav
- [ ] Manter página `/recurring` como histórico de regras (sem destaque na nav)

---

## 5. Notas técnicas

```
TypeToggle:
  → Componente controlled com useState em TransactionForm
  → value: "EXPENSE" | "INCOME"
  → onChange: atualiza hidden input + filtra categorias em tempo real
  → Hidden input carrega o valor para a server action

Recurring toggle:
  → useState(isRecurring: boolean)
  → Conditional render com transição (max-height: 0 → auto)
  → Campos: frequency (select), recurrenceEnd (date, opcional)
  → Na action: if (isRecurring) prisma.recurringRule.create({ ... })

Delete sem confirm nativo:
  → useState<string | null>(confirmingId)
  → 1º clique: setConfirmingId(tx.id) → botão vira "Confirmar?"
  → 2º clique: deleteTransaction(tx.id)
  → useEffect: limpar confirmingId após 3s sem ação

Filtros como chips:
  → Mês: ← {label} →, router.push com params atualizados
  → Tipo: botões "Todos / Despesa / Receita" com estilo ativo
  → Conta: esconder se accounts.length === 1

Currency fix:
  → transactions/page.tsx: passar currency do session para TransactionList como prop
  → transaction-list.tsx: receber currency: string, usar em Intl.NumberFormat
```
