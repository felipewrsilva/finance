import { redirect } from "next/navigation";

// Recurring rules no longer have a dedicated edit page.
// Edit the original transaction directly.
export default async function EditRecurringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/transactions/${id}/edit`);
}

