"use client";

import { AuthContext } from "@/app/_contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebase/firebase";
import { IEvent } from "@/types";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import EventEditDialog from "./EventEditDialog";

export function EventsTable() {
  const user = useContext(AuthContext);
  const [events, setEvents] = useState<IEvent[]>([]);

  useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(db, "events"),
        where("userId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newEvents: IEvent[] = [];
        snapshot.forEach((doc) => {
          newEvents.push({ ...doc.data(), id: doc.id } as IEvent);
        });
        setEvents(newEvents);
        return () => unsubscribe();
      });
    }
  }, [user.uid]);

  return (
    <Table>
      <TableCaption>A list of your events.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Location</TableHead>
          <TableHead># of Vendors</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow
            key={event.id}
            onClick={() => {
              console.log(event);
            }}
          >
            <TableCell>{event.name}</TableCell>
            <TableCell>{event.date}</TableCell>
            <TableCell>{event.location}</TableCell>
            <TableCell>{event?.vendors?.length || 0}</TableCell>
            <TableCell className="text-right">
              <a href={`/events/${event.id}`} className="mr-2">
                Manage
              </a>
              <EventEditDialog event={event} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
