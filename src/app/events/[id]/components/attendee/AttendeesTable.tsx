"use client";

import { useVendor } from "@/app/_hooks/vendors";
import { Badge } from "@/components/ui/badge";
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
  const { vendors } = useVendor(eventId);
  const [selectedAttendee, setSelectedAttendee] = useState<IAttendee>();
  const [openAttendeeDetails, setOpenAttendeeDetails] = useState(false);

  // Map vendor IDs to names for quick lookup
  const vendorNameById = vendors.reduce((map, vendor) => {
    map[vendor.id] = vendor.name;
    return map;
  }, {} as Record<string, string>);

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
          <TableHead>Preferred Vendors</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendees.map((attendee) => (
          <TableRow
            key={attendee.id}
            onClick={() => {
              setSelectedAttendee(attendee);
              setOpenAttendeeDetails(true);
            }}
          >
            <TableCell>{attendee.identifier}</TableCell>
            <TableCell>{attendee.name}</TableCell>
            <TableCell>{attendee.phoneNumber}</TableCell>
            <TableCell>{attendee.email}</TableCell>
            <TableCell>{attendee.status}</TableCell>
            <TableCell>
              {attendee.preferredVendors?.length ? (
                attendee.preferredVendors.map((vendorId) => (
                  <Badge key={vendorId} className="mr-1">
                    {vendorNameById[vendorId] || "Unknown"}
                  </Badge>
                ))
              ) : (
                <span>No preferences</span>
              )}
            </TableCell>
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
