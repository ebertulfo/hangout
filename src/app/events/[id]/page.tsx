import { AttendeesProvider } from "@/app/_contexts/AttendeesContext";
import { getCurrentUser } from "@/lib/firebase/firebase-admin";
import { redirect } from "next/navigation";
import EventManagement from "./components/EventManagement";
// Events Page - lists all the events and allows user to create or update events
export default async function EventPage({
  params: { id },
}: {
  params: { id: string };
}) {
  // Get event id from params
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");
  return (
    <AttendeesProvider eventId={id}>
      <EventManagement />
    </AttendeesProvider>
  );
}
