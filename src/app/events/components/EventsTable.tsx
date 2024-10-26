"use client";

import { AuthContext } from "@/app/_contexts/AuthContext";
import { useEvents } from "@/app/_hooks/events";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContext } from "react";
import EventEditDialog from "./EventEditDialog";

export function EventsTable() {
  const user = useContext(AuthContext);
  const { events } = useEvents(user?.uid);

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
