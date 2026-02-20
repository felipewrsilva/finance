import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";

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
          <a href="/dashboard/budgets" className="hover:text-gray-900">
            Budgets
          </a>
          <a href="/dashboard/reports" className="hover:text-gray-900">
            Reports
          </a>
          <a href="/dashboard/settings/categories" className="hover:text-gray-900">
            Categories
          </a>
          <a href="/dashboard/settings/currency" className="hover:text-gray-900">
            Settings
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
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:px-6 sm:pb-8 lg:max-w-5xl lg:px-8 lg:py-8 xl:max-w-6xl">{children}</main>
      <BottomNav />
    </div>
  );
}
