// Events Page - lists all the events and allows user to create or update events
import EventAddDialog from "./components/EventAddDialog";
import { EventsTable } from "./components/EventsTable";

export default async function EventPage() {
  return (
    <main className="container">
      <h1>Events</h1>
      <EventAddDialog />
      <EventsTable />
    </main>
  );
}
