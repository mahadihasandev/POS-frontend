import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { StoreProvider } from "@/components/shared/StoreProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "POS SuperShop | High-Performance Retail Client",
  description: "Next.js 15 client powered by RTK Query and Laravel 13 Octane backend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased bg-slate-950 text-slate-100 min-h-screen`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
