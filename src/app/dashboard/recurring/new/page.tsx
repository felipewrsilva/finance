import { redirect } from "next/navigation";

// Recurring rules no longer have a dedicated creation flow.
// Recurrence is configured directly from the transaction form.
export default function NewRecurringPage() {
  redirect("/dashboard/transactions/new");
}

