import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase/firebase";
import { IQueuedAttendee } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useMeetings } from "./meetings";

export function useQueue(eventId: string) {
  const [queue, setQueue] = useState<IQueuedAttendee[]>([]);
  const { meetings } = useMeetings(eventId);
  const { toast } = useToast();
  useEffect(() => {
    // Create realtime connection for the event's attendees
    const unsubAttendees = onSnapshot(
      collection(db, "events", eventId as string, "queue"),
      (snapshot) => {
        const newQueue: IQueuedAttendee[] = [];
        snapshot.forEach((doc) => {
          newQueue.push({ ...doc.data(), id: doc.id } as IQueuedAttendee);
        });
        console.log("Queue", newQueue);
        setQueue(newQueue);
      }
    );
    return () => {
      unsubAttendees();
    };
  }, [eventId]);

  const queueAttendee = async (
    attendeeId: string,
    attendeeName: string,
    attendeeIdentifier: string,
    vendorId: string
  ) => {
    const attendeeQueue = {
      attendeeId,
      attendeeName,
      attendeeIdentifier,
      vendorId,
      eventId,
      queuedAt: new Date().toISOString(),
    };
    try {
      // Check if attendee is already in a meeting. Doesn't matter which vendor, they can't be in a meeting and in the queue at the same time
      const attendeeInMeeting = meetings.find(
        (meeting) => meeting.attendeeId === attendeeId && meeting.meetingEndedAt
      );
      if (attendeeInMeeting) {
        toast({
          title: "Attendee is already in a meeting",
          variant: "destructive",
        });
        return;
      }
      // Check if the attendee is already in the queue for the same vendor
      const attendeeInQueue = queue.find(
        (attendee) =>
          attendee.attendeeId === attendeeId && attendee.vendorId === vendorId
      );
      if (attendeeInQueue) {
        toast({
          title: "Attendee already in queue for this vendor.",
          variant: "destructive",
        });
        return;
      }
      await addDoc(collection(db, `/events/${eventId}/queue`), attendeeQueue);
      toast({
        title: "Attendee queued",
      });
    } catch (error) {
      toast({
        title: "Error adding to queue",
      });
    }
  };

  const dequeueAttendee = async (attendeeId: string) => {
    // Implement this function to remove an attendee from the queue
    return await deleteDoc(doc(db, `/events/${eventId}/queue/${attendeeId}`));
  };

  const update = async (attendeeId: string, values: object) => {
    let attendeeRef = doc(db, `/events/${eventId}/queue/${attendeeId}`);
    await updateDoc(attendeeRef, {
      ...values,
    });
  };

  return {
    queue,
    queueAttendee,
    dequeueAttendee,
    update,
  };
}
