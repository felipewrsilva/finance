import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountForm } from "@/components/accounts/account-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditAccountPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const account = await prisma.account.findFirst({
    where: { id, userId: session.user.id, isActive: true },
  });

  if (!account) notFound();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Edit account</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <AccountForm
          account={{ ...account, balance: account.balance.toString() }}
        />
      </div>
    </div>
  );
}
