import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditRecurringPage({ params }: Props) {
  const { locale, id } = await params;
  redirect(`/${locale}/dashboard/transactions/${id}/edit`);
}
