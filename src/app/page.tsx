import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// Redirect root to default locale dashboard
export default function Home() {
  redirect(`/${routing.defaultLocale}/dashboard`);
}
