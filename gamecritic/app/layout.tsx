import type { Metadata } from "next";

import { CookieConsentBanner } from "@/components/analytics/cookie-consent";
import { getSiteUrl } from "@/lib/utils/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "GameCritic",
    template: "%s | GameCritic",
  },
  description: "Community-driven game review platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className="h-full antialiased">
      <body className="min-h-full bg-slate-100 text-slate-900">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
