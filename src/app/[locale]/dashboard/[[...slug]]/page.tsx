import { redirectHome } from "@/lib/redirect-home";

type Props = { params: Promise<{ locale: string }> };

export default async function LegacyLocaleDashboardRedirect({ params }: Props) {
  const { locale } = await params;
  redirectHome(locale);
}
