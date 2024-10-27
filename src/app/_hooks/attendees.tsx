// Updated useAttendees Hook with preferredVendors support

import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase/firebase";
import { IAttendee } from "@/types";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useAttendees(eventId: string) {
  const [attendees, setAttendees] = useState<IAttendee[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Real-time connection for the event's attendees
    const unsubAttendees = onSnapshot(
      collection(db, "events", eventId as string, "attendees"),
      (snapshot) => {
        const newAttendees: IAttendee[] = [];
        snapshot.forEach((doc) => {
          newAttendees.push({ ...doc.data(), id: doc.id } as IAttendee);
        });
        setAttendees(newAttendees);
      }
    );

    return () => {
      unsubAttendees();
    };
  }, [eventId]);

  const createAttendee = async (values: Partial<IAttendee>) => {
    let attendeeRef = collection(db, `/events/${eventId}/attendees`);
    await addDoc(attendeeRef, {
      ...values,
      status: "unassigned",
      preferredVendors: values.preferredVendors || [], // Default to empty array if not provided
    });
    toast({
      title: "Attendee Registered",
    });
  };

  const updateAttendee = async (
    attendeeId: string,
    values: Partial<IAttendee>
  ) => {
    let attendeeRef = doc(db, `/events/${eventId}/attendees/${attendeeId}`);
    await updateDoc(attendeeRef, {
      ...values,
    });
    toast({
      title: "Attendee Updated",
    });
  };

  return {
    attendees,
    createAttendee,
    updateAttendee,
  };
}
