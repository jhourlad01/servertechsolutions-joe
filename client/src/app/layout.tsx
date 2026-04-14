import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Issue Intake & Smart Summary | ServerTech",
  description: "Enterprise-grade issue tracking with AI intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <ThemeProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 bg-[var(--background)] overflow-y-auto transition-colors duration-300">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
