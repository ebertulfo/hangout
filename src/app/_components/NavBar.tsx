"use client";
import { signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import React, { useContext } from "react";
import { AuthContext } from "../_contexts/AuthContext";

const Navbar: React.FC = () => {
  const user = useContext(AuthContext);
  const router = useRouter();
  const handleSignOut = async () => {
    const isOk = await signOut();

    if (isOk) router.push("/sign-in");
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Hangout
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {!user ? (
                  <a
                    href="/sign-in"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </a>
                ) : (
                  <>
                    <a
                      href="/dashboard"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/events"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Events
                    </a>
                    <a
                      href="/vendors"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Vendors
                    </a>
                    <a
                      href="#"
                      onClick={() => {
                        handleSignOut();
                      }}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium justify-end"
                    >
                      Sign Out
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
