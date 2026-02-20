import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserCurrencies } from "@/modules/currencies/actions";
import { AccountForm } from "@/components/accounts/account-form";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ id: string; locale: string }> };

export default async function EditAccountPage({ params }: Props) {
  const { id, locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const [account, currencyPrefs, t] = await Promise.all([
    prisma.account.findFirst({
      where: { id, userId: session.user.id, isActive: true },
    }),
    getUserCurrencies(),
    getTranslations("accounts"),
  ]);

  if (!account) notFound();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-bold text-gray-900">{t("editTitle")}</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <AccountForm
          account={{ ...account, balance: account.balance.toString() }}
          currency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale}
        />
      </div>
    </div>
  );
}
