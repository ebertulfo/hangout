import { useAttendees } from "@/app/_hooks/attendees";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IAttendee } from "@/types";
import { useState } from "react";
export function UnassignedAttendeesList({
  eventId,
  openMeetingsDialog,
  openQueueDialog,
}: {
  eventId: string;
  openMeetingsDialog: (attendee: IAttendee) => void;
  openQueueDialog: (attendee: IAttendee) => void;
}) {
  const { attendees } = useAttendees(eventId);
  const [unassignedAttendeesSearch, setUnassignedAttendeesSearch] =
    useState("");
  return (
    <div className="flex-row">
      <h3 className="text-xl font-bold mb-5">Unassigned Attendees</h3>
      <Card className="w-[360px;]">
        <CardHeader>
          <Input
            placeholder="Search Identifier or Name"
            onChange={(e) => {
              setUnassignedAttendeesSearch(e.target.value);
            }}
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {attendees
            .filter(
              (attendee) =>
                attendee.status === "unassigned" &&
                (attendee.identifier
                  .toLowerCase()
                  .includes(unassignedAttendeesSearch.toLowerCase()) ||
                  attendee.name
                    .toLowerCase()
                    .includes(unassignedAttendeesSearch.toLowerCase()))
            )
            .map((attendee) => (
              <Card key={attendee.id}>
                <CardHeader>
                  <CardTitle>
                    {attendee.identifier} - {attendee.name}
                  </CardTitle>
                  <CardFooter>
                    <Button
                      onClick={() => openMeetingsDialog(attendee)}
                      className="text-primary-foreground"
                    >
                      Assign
                    </Button>
                    <Button
                      onClick={() => openQueueDialog(attendee)}
                      className="text-primary-foreground"
                    >
                      Queue
                    </Button>
                  </CardFooter>
                </CardHeader>
              </Card>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
