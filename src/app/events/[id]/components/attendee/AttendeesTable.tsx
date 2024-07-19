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
import { useState } from "react";
import AttendeeDetailsDialog from "./AttendeeDetailsDialog";

export function AttendeesTable({
  eventId,
  attendees,
}: {
  eventId: string;
  attendees: IAttendee[];
}) {
  const [selectedAttendee, setSelectedAttendee] = useState<IAttendee>();
  const [openAttendeeDetails, setOpenAttendeeDetails] = useState(false);
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
        {attendees &&
          attendees.map((attendee: IAttendee) => (
            <TableRow
              key={attendee.id}
              onClick={() => {
                console.log(attendee);
                setSelectedAttendee(attendee);
                setOpenAttendeeDetails(true);
              }}
            >
              <TableCell>{attendee.identifier}</TableCell>
              <TableCell>{attendee.name}</TableCell>
              <TableCell>{attendee.phoneNumber}</TableCell>
              <TableCell>{attendee.email}</TableCell>
              <TableCell>{attendee.status}</TableCell>
            </TableRow>
          ))}
      </TableBody>
      {selectedAttendee ? (
        <AttendeeDetailsDialog
          attendee={selectedAttendee}
          eventId={eventId}
          isOpen={openAttendeeDetails}
          handleClose={() => setOpenAttendeeDetails(false)}
        />
      ) : null}
    </Table>
  );
}
