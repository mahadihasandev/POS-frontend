import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { StoreProvider } from "@/components/shared/StoreProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "POS SuperShop | Supermarket Cashier Terminal",
  description: "Next.js 15 client powered by RTK Query and Laravel 13 Octane backend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased bg-slate-50 text-slate-800 min-h-screen selection:bg-indigo-100 selection:text-indigo-800`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
