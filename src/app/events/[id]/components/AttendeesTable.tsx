"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IAttendee } from "@/types";
import EditAttendeeDialog from "./EditAttendeeDialog";

export function AttendeesTable({
  eventId,
  attendees,
}: {
  eventId: string;
  attendees: IAttendee[];
}) {
  return (
    <Table>
      <TableCaption>A list of attendees</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Identifier</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Phone Number</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendees.map((attendee) => (
          <TableRow
            key={attendee.id}
            onClick={() => {
              console.log(event);
            }}
          >
            <TableCell>{attendee.identifier}</TableCell>
            <TableCell>{attendee.name}</TableCell>
            <TableCell>{attendee.phoneNumber}</TableCell>
            <TableCell>{attendee.email}</TableCell>
            <TableCell>{attendee.status}</TableCell>
            <TableCell className="text-right">
              <EditAttendeeDialog attendee={attendee} eventId={eventId} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
