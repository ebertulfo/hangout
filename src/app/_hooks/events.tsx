import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase/firebase";
import { IEvent, IExistingEvent } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useEvents(userId: string) {
  const [events, setEvents] = useState<IEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      const q = query(collection(db, "events"), where("userId", "==", userId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newEvents: IExistingEvent[] = [];
        snapshot.forEach((doc) => {
          newEvents.push({ ...doc.data(), id: doc.id } as IExistingEvent);
        });
        setEvents(newEvents);
        return () => unsubscribe();
      });
    }
  }, [userId]);

  const addEvent = async (event: IEvent) => {
    try {
      const res = await addDoc(collection(db, "events"), event);
      toast({
        title: "Event Added",
      });
    } catch (error) {
      toast({
        title: "Error adding event",
        variant: "destructive",
      });
    }
  };

  const updateEvent = async (event: IExistingEvent) => {
    try {
      const eventDoc = doc(db, "events", event.id);
      await updateDoc(eventDoc, { ...event });
      toast({
        title: "Event Updated",
      });
    } catch (error) {
      toast({
        title: "Error updating event",
        variant: "destructive",
      });
    }
  };

  const removeEvent = async (eventId: string) => {
    try {
      const eventDoc = doc(db, "events", eventId);
      await deleteDoc(eventDoc);
      toast({
        title: "Event Deleted",
      });
    } catch (error) {
      toast({
        title: "Error deleting event",
        variant: "destructive",
      });
    }
  };

  return {
    events,
    addEvent,
    updateEvent,
    removeEvent,
  };
}
