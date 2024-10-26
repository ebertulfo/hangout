"use client";
// Context that handles the authentication of the user

// Path: src/app/_contexts/AuthContext.tsx
import { auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { redirect, usePathname } from "next/navigation";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<any>(auth.currentUser || {});
  const currentPath = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("@@@ USER", user);
    if (!user && currentPath !== "/sign-in") {
      redirect("/sign-in");
    }
  }, [user, currentPath]);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};
