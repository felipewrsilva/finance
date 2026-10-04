import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BRAND } from "@/lib/brand";
import { ToolsShell } from "@/components/layout/tools-shell";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: `${BRAND.name}. ${BRAND.tagline}`,
  description:
    "Semeia. Ferramentas públicas em português: extra no tempo, renda, mix de renda fixa e variável, e quatro caminhos no papel.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${figtree.variable} ${fraunces.variable} antialiased`}>
        <ToolsShell>{children}</ToolsShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
