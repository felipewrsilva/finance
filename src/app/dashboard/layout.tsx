import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
        <a href="/dashboard" className="text-lg font-bold text-indigo-600">
          Finance
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
          <a href="/dashboard" className="hover:text-gray-900">
            Overview
          </a>
          <a href="/dashboard/accounts" className="hover:text-gray-900">
            Accounts
          </a>
          <a href="/dashboard/transactions" className="hover:text-gray-900">
            Transactions
          </a>
          <a href="/dashboard/recurring" className="hover:text-gray-900">
            Recurring
          </a>
          <a href="/dashboard/budgets" className="hover:text-gray-900">
            Budgets
          </a>
          <a href="/dashboard/reports" className="hover:text-gray-900">
            Reports
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? "User"}
              className="h-8 w-8 rounded-full"
            />
          )}
          <span className="hidden text-sm text-gray-600 sm:block">
            {session.user.name}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
