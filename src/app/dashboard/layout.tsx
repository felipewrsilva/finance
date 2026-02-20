import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProfileMenu } from "@/components/layout/profile-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <a href="/dashboard" className="text-sm font-semibold tracking-tight text-gray-900">
          Finance
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-500 sm:flex">
          <a href="/dashboard" className="transition-colors hover:text-gray-900">
            Overview
          </a>
          <a href="/dashboard/accounts" className="transition-colors hover:text-gray-900">
            Accounts
          </a>
          <a href="/dashboard/transactions" className="transition-colors hover:text-gray-900">
            Transactions
          </a>
          <a href="/dashboard/budgets" className="transition-colors hover:text-gray-900">
            Budgets
          </a>
          <a href="/dashboard/reports" className="transition-colors hover:text-gray-900">
            Reports
          </a>
        </nav>
        <ProfileMenu user={session.user} signOutAction={signOutAction} />
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:px-6 sm:pb-8 lg:max-w-5xl lg:px-8 lg:py-8 xl:max-w-6xl">{children}</main>
      <BottomNav />
    </div>
  );
}
