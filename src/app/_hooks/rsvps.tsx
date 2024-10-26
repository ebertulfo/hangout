import { db } from "@/lib/firebase/firebase";
import { IRsvp } from "@/types";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useRSVPs(eventId: string) {
  const [rsvps, setRSVPs] = useState<IRsvp[]>([]);
  useEffect(() => {
    // Create realtime connection for the event's attendees
    const unsubAttendees = onSnapshot(
      collection(db, "events", eventId as string, "rsvps"),
      (snapshot) => {
        const newRsvps: IRsvp[] = [];
        snapshot.forEach((doc) => {
          newRsvps.push({ ...doc.data(), id: doc.id } as IRsvp);
        });
        setRSVPs(newRsvps);
      }
    );

    return () => {
      unsubAttendees();
    };
  }, [eventId]);

  const updateRSVP = async (rsvpId: string, values: object) => {
    let rsvpRef = doc(db, `/events/${eventId}/rsvps/${rsvpId}`);
    await updateDoc(rsvpRef, {
      ...values,
    });
    console.log(values);
  };

  return {
    rsvps,
    updateRSVP,
  };
}
