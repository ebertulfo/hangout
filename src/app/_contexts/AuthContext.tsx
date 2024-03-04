"use client";
// Context that handles the authentication of the user

// Path: src/app/_contexts/AuthContext.tsx
import { auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{
  initialUser: any;
  children: React.ReactNode;
}> = ({ initialUser, children }) => {
  const [user, setUser] = useState(initialUser || auth.currentUser);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};
