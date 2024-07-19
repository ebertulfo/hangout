import { getCurrentUser } from "@/lib/firebase/firebase-admin";
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
  const currentUser = await getCurrentUser();
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider initialUser={currentUser?.toJSON()}>
          <Navbar />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
