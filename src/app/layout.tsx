import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./_components/NavBar";
import { AuthProvider } from "./_contexts/AuthContext";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hangout - Events Management System",
  description: "Create by people from Qanvast.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = {};
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
