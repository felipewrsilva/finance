import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export function redirectHome(locale?: string): never {
  redirect(`/${locale ?? routing.defaultLocale}`);
}
