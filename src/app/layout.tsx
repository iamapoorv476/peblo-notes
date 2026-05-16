import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Peblo Notes — AI Workspace",
  description: "Your collaborative AI-powered notes workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className} suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}