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
  try {
    const currentUser = await getCurrentUser();
    console.log("currentUser", currentUser);
    if (!currentUser) redirect("/sign-in");
  } catch (error) {
    console.error("Error getting current user", error);
    // Logout
    const response = await fetch(`${process.env.APP_URL}/api/auth/sign-out`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    redirect("/sign-in");
  }

  return <EventManagement />;
}
