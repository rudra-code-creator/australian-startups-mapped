import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Australian Startup Map",
  description:
    "A curated map of Australian startup offices and hubs across Brisbane, Sydney, Melbourne, Adelaide, and Perth."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fraunces.className}>
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}

