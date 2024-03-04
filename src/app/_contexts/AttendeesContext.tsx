// Context to manage the attendees of the event.

"use client";
import { db } from "@/lib/firebase/firebase";
import { IAttendee } from "@/types";
// Context that handles the authentication of the user

// Path: src/app/_contexts/AuthContext.tsx
import { collection, onSnapshot } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";

export const AttendeesContext = createContext<any>([]);

export const AttendeesProvider: React.FC<{
  eventId: string;
  children: React.ReactNode;
}> = ({ eventId, children }) => {
  const [attendees, setAttendees] = useState<IAttendee[]>([]);
  useEffect(() => {
    const q = collection(db, `/events/${eventId}/attendees`);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAttendees: IAttendee[] = [];
      snapshot.forEach((doc) => {
        newAttendees.push({ ...doc.data(), id: doc.id } as IAttendee);
      });
      setAttendees(newAttendees);
      return () => unsubscribe();
    });
  }, [eventId]);

  return (
    <AttendeesContext.Provider value={attendees}>
      {children}
    </AttendeesContext.Provider>
  );
};
