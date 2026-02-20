import {
  addUserCurrency,
  removeUserCurrency,
  updateDefaultCurrency,
  getUserCurrencies,
} from "@/modules/currencies/actions";
import { SUPPORTED_CURRENCIES } from "@/modules/currencies/constants";

export default async function CurrencySettingsPage() {
  const { defaultCurrency, currencies } = await getUserCurrencies();

  const availableToAdd = SUPPORTED_CURRENCIES.filter(
    (c) => !currencies.includes(c.code)
  );

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Currency settings</h1>
        <p className="text-sm text-gray-500">
          Manage your default currency and enabled currencies.
        </p>
      </div>

      {/* ── Default currency ────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Default currency</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Used for dashboard totals and new transactions.
          </p>
        </div>

        <form action={updateDefaultCurrency} className="flex gap-2">
          <select
            name="currency"
            defaultValue={defaultCurrency}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800"
          >
            Save
          </button>
        </form>
      </section>

      {/* ── Enabled currencies ──────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Enabled currencies</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            These appear as options when recording a transaction.
          </p>
        </div>

        <ul className="space-y-2">
          {currencies.map((code) => {
            const info = SUPPORTED_CURRENCIES.find((c) => c.code === code);
            const isDefault = code === defaultCurrency;
            return (
              <li
                key={code}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {info?.label ?? code}
                  </span>
                  {isDefault && (
                    <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      default
                    </span>
                  )}
                </div>
                {!isDefault && (
                  <form action={removeUserCurrency}>
                    <input type="hidden" name="currency" value={code} />
                    <button
                      type="submit"
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-white hover:text-red-600"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>

        {/* Add currency */}
        {availableToAdd.length > 0 && (
          <form action={addUserCurrency} className="flex gap-2 pt-2 border-t border-gray-100">
            <select
              name="currency"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Add a currency…</option>
              {availableToAdd.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 active:bg-gray-800"
            >
              Add
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
