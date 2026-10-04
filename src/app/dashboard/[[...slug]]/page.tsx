import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/** Old personal-finance routes retire into the public tools home. */
export default function LegacyDashboardRedirect() {
  redirect(`/${routing.defaultLocale}`);
}
