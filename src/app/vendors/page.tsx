// Events Page - lists all the events and allows user to create or update events

import { getCurrentUser } from "@/lib/firebase/firebase-admin";
import { redirect } from "next/navigation";
import { VendorsTable } from "./components/VendorsTable";

export default async function VendorsPage() {
  // Get event id from params
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");
  return (
    <main className="container">
      <h1>Vendors</h1>
      <VendorsTable />
    </main>
  );
}
