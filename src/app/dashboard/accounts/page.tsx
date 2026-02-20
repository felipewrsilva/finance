import { getAccounts } from "@/modules/accounts/actions";
import { AccountCard } from "@/components/accounts/account-card";
import { auth } from "@/auth";

export default async function AccountsPage() {
  const [accounts, session] = await Promise.all([getAccounts(), auth()]);
  const currency = session?.user?.currency ?? "BRL";

  const totalBalance = accounts.reduce((sum: number, a) => sum + Number(a.balance), 0);
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(totalBalance);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-500">
            Total balance:{" "}
            <span className="font-semibold text-gray-900">{formatted}</span>
          </p>
        </div>
        <a
          href="/dashboard/accounts/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          + New account
        </a>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-gray-500">No accounts yet.</p>
          <a
            href="/dashboard/accounts/new"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Create your first account →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={{ ...account, balance: account.balance.toString() }}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
}
