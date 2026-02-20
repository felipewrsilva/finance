import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Finance</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session.user.name}</span>
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
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-500">Dashboard coming soon.</p>
      </div>
    </main>
  );
}
