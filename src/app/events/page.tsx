// Events Page - lists all the events and allows user to create or update events
import { getCurrentUser } from "@/lib/firebase/firebase-admin";
import { redirect } from "next/navigation";
import EventAddDialog from "./components/EventAddDialog";
import { EventsTable } from "./components/EventsTable";

export default async function EventPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");
  return (
    <main className="container">
      <h1>Events</h1>
      <EventAddDialog />
      <EventsTable />
    </main>
  );
}
