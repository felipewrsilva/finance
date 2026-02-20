import { AccountForm } from "@/components/accounts/account-form";

export default function NewAccountPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-bold text-gray-900">New account</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <AccountForm />
      </div>
    </div>
  );
}
