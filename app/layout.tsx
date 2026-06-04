import type { Metadata } from "next";
import { Special_Elite, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { CRTOverlay } from "@/components/redthread/crt-overlay";
import { SiteHeader } from "@/components/nav/site-header";
import { SiteFooter } from "@/components/nav/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

/** Typewriter display face — the REDTHREAD voice. Single weight (400). */
const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-special-elite",
  display: "swap",
});

/** Monospace workhorse — body, UI, labels, classified tags. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "REDTHREAD // Pull the thread.",
    template: "%s // REDTHREAD",
  },
  description:
    "An open dossier. Pin the evidence, draw the string, connect the dots. A conspiratorial corner of the web where the board is the message.",
  applicationName: "REDTHREAD",
  authors: [{ name: "Kairos" }],
  keywords: ["conspiracy", "evidence board", "investigation", "dossier", "redthread"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${specialElite.variable} ${jetbrains.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider delay={200}>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </TooltipProvider>
        {/* Atmosphere, mounted once. Non-interactive; honors reduced-motion. */}
        <CRTOverlay />
        <Toaster
          position="bottom-right"
          toastOptions={{ classNames: { toast: "font-mono text-xs" } }}
        />
      </body>
    </html>
  );
}
