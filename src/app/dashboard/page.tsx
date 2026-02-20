import { auth } from "@/auth";
import { getAccounts } from "@/modules/accounts/actions";
import { ACCOUNT_TYPE_ICONS } from "@/modules/accounts/constants";

export default async function DashboardPage() {
  const [session, accounts] = await Promise.all([auth(), getAccounts()]);
  const currency = session?.user?.currency ?? "BRL";

  const fmt = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);

  const totalBalance = accounts.reduce((sum: number, a) => sum + Number(a.balance), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Hi, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500">Here&apos;s your financial overview.</p>
      </div>

      {/* Total balance */}
      <div className="rounded-xl bg-indigo-600 p-6 text-white shadow">
        <p className="text-sm font-medium opacity-80">Total balance</p>
        <p className="mt-1 text-3xl font-bold">{fmt(totalBalance)}</p>
        <p className="mt-1 text-xs opacity-60">
          Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Accounts summary */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Accounts</h2>
          <a
            href="/dashboard/accounts"
            className="text-xs text-indigo-600 hover:underline"
          >
            Manage →
          </a>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No accounts yet.{" "}
            <a
              href="/dashboard/accounts/new"
              className="font-medium text-indigo-600 hover:underline"
            >
              Create one →
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{ACCOUNT_TYPE_ICONS[a.type]}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {a.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    Number(a.balance) >= 0 ? "text-gray-900" : "text-red-600"
                  }`}
                >
                  {fmt(Number(a.balance))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
