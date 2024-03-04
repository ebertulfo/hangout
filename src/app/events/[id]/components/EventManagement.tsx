"use client";
import {
  AttendeesContext,
  AttendeesProvider,
} from "@/app/_contexts/AttendeesContext";
import { db } from "@/lib/firebase/firebase";
import { IAttendee, IEvent, IVendorInEvent } from "@/types";
import dayjs from "dayjs";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import AddAttendeeDialog from "./AddAttendeeDialog";
import AddVendorDialog from "./AddVendorDialog";
import { AttendeesTable } from "./AttendeesTable";
import VendorCard from "./VendorCard";

export default function EventManagement() {
  const attendees: IAttendee[] = useContext(AttendeesContext);
  const [event, setEvent] = useState<IEvent>();
  const [vendors, setVendors] = useState<IVendorInEvent[]>([]);
  const { id }: { id: string } = useParams();

  useEffect(() => {
    // Get event from firestore
    if (id) {
      console.log("@@@ query", "events", id, "vendors");
      const unsub = onSnapshot(
        collection(db, "events", id as string, "vendors"),
        (snapshot) => {
          console.log("@@@@ VENDORS SNAPSHOT", snapshot);
          const data: IVendorInEvent[] = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as IVendorInEvent)
          );
          setVendors(data);
        }
      );
      const eventDocRef = doc(db, "events", id as string);
      getDoc(eventDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data: IEvent = docSnap.data() as IEvent;
          data.date = dayjs(new Date(data.date)).format("MMMM D, YYYY");
          setEvent({ ...data, id });
        }
      });

      return () => unsub();
    }
  }, [id]);
  return event ? (
    <AttendeesProvider eventId={id}>
      <main className="flex flex-row gap-5 m-5">
        <div>
          <h1>
            {event?.name} - {event?.location} {event?.date}
          </h1>
          {event && <AddVendorDialog event={event} />}
          <h2>Event Vendors</h2>
          <div className={"flex gap-10"}>
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} eventId={event.id} vendor={vendor} />
            ))}
          </div>
        </div>
        <div>
          <h2>Event Attendees</h2>
          <AddAttendeeDialog
            eventId={event.id}
            attendeesCount={attendees.length}
          />
          <AttendeesTable eventId={event.id} attendees={attendees} />
        </div>
      </main>
    </AttendeesProvider>
  ) : (
    "Please wait..."
  );
}
