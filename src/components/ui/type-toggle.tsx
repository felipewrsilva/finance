"use client";

interface TypeToggleProps {
  value: "INCOME" | "EXPENSE";
  onChange: (value: "INCOME" | "EXPENSE") => void;
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
      {(["EXPENSE", "INCOME"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
            value === t
              ? t === "EXPENSE"
                ? "bg-white shadow-sm text-red-600"
                : "bg-white shadow-sm text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t === "EXPENSE" ? "Expense" : "Income"}
        </button>
      ))}
    </div>
  );
}
