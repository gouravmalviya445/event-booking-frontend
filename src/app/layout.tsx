import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gatherly | Discover memorable events",
  description: "Find curated events, book tickets, and manage unforgettable experiences in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body
        className={
          `${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden bg-[#f7f2eb] text-stone-900`
        }
      >
        <div className="mx-auto max-w-[1400px] px-3 sm:px-5 lg:px-6">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
