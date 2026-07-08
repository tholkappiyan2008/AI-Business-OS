import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/hooks/useClientStore";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import ProductNoticeWidget from "@/components/ProductNoticeWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Business OS - Executive Autonomous Platform",
  description: "AI-powered Operating System for CEOs and Executive Teams to monitor performance, chat with specialized agents, and automate operational workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <AnnouncementBanner />
        <ProductNoticeWidget />
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
