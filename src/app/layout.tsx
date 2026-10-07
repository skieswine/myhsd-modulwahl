import { AppProvider } from "@/store/app-store";

import type { Metadata, Viewport } from "next";
import { OfferingsProvider } from "@/context/OfferingsContext";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "myHSD · Modulwahl",
  description:
    "Modulwahl-Flow der Hochschule Düsseldorf — Bewerbungen, Priorisierung und Projektdetails.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="font-sans antialiased">
        <AppProvider>
          <OfferingsProvider>{children}</OfferingsProvider>
        </AppProvider>
      </body>
    </html>
  );
}
