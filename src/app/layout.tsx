import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { BRAND } from "@/lib/brand";
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
    "Semeia: veja o que um extra pode virar se for investimento, como a renda se divide e o que o tempo faz. Em português. Sem cadastro.",
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
        {children}
      </body>
    </html>
  );
}
