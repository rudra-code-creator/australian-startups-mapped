import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeScript } from "@/components/theme/theme-script";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Startup Map",
  description:
    "A curated map of startup offices and hubs across Australia, New Zealand, the Pacific, Indonesia, Malaysia, Singapore, India, and the Greater Bay Area."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={fraunces.className}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className={dmSans.className}>
        <ThemeProvider>
          <Shell>{children}</Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
