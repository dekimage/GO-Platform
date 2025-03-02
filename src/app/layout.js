"use client";

import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "next-themes";
import ReusableLayout from "@/reusable-ui/ReusableLayout";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReusableLayout>{children}</ReusableLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
