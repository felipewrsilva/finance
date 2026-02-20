import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { ProfileMenu } from "@/components/layout/profile-menu";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: `/${locale}/login` });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <a href={`/${locale}/dashboard`} className="text-sm font-semibold tracking-tight text-gray-900">
          Finance
        </a>
        <DesktopNav locale={locale} />
        <ProfileMenu user={session.user} signOutAction={signOutAction} locale={locale} />
      </header>
      <main className="mx-auto w-full max-w-screen-lg px-4 py-6 pb-24 sm:px-6 sm:pb-8 lg:px-8 lg:py-8">
        {children}
      </main>
      <BottomNav locale={locale} />
    </div>
  );
}
