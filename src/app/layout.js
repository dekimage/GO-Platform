// "use client";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ReusableLayout from "@/reusable-ui/ReusableLayout";
// import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  // const [isClient, setIsClient] = useState(false);

  // useEffect(() => {
  //   setIsClient(true);
  // }, []);

  // if (!isClient) {
  //   return null;
  // }
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <ReusableLayout>{children}</ReusableLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
