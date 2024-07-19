import { useAttendees } from "@/app/_hooks/Attendees";
import { useMeetings } from "@/app/_hooks/Meetings";
import { useTimerTick } from "@/app/_hooks/TimerTick";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { IAttendee, IVendorInEvent } from "@/types";
import { useState } from "react";
import { MeetingAssignmentDialog } from "./MeetingAssignmentDialog";
import { QueueManagement } from "./QueueManagement";

export function MeetingManagement({
  vendors,
  eventId,
}: {
  vendors: IVendorInEvent[];
  eventId: string;
}) {
  const { attendees } = useAttendees(eventId);
  const { time } = useTimerTick();
  const { endMeeting } = useMeetings(eventId);

  const [selectedAttendee, setSelectedAttendee] = useState<IAttendee | null>(
    null
  );

  const [unassignedAttendeesSearch, setUnassignedAttendeesSearch] =
    useState("");

  const [openMeetingAssignmentDialog, setOpenMeetingAssignmentDialog] =
    useState(false);

  const handleOpenMeetingAssignemntDialog = (attendee: IAttendee) => {
    setSelectedAttendee(attendee);
    setOpenMeetingAssignmentDialog(true);
  };

  return (
    <div>
      <MeetingAssignmentDialog
        isOpen={openMeetingAssignmentDialog}
        handleClose={() => setOpenMeetingAssignmentDialog(false)}
        attendee={selectedAttendee!}
        vendors={vendors}
        eventId={eventId}
      />
      <h1 className=" text-2xl font-semibold mb-5">Meetings</h1>
      {/* <div>
        <h2 className="text-lg font-normal">Vendor Slots</h2>
        <div className="flex gap-5">
          {
            // Create a list of vendor slots
            vendors.map((vendor) => (
              <div key={vendor.id} className="flex flex-col">
                <h3>{vendor.name}</h3>
                <p>
                  Slots:{" "}
                  {
                    attendees.filter(
                      (attendee) => attendee.currentMeetingVendorId == vendor.id
                    ).length
                  }
                  /{vendor.slots}
                </p>
              </div>
            ))
          }
        </div>
      </div>
      <Separator className="my-12" /> */}
      <div className="flex flex-row gap-5">
        {/* <Card className="w-[380px]">
          <CardHeader>
            <CardTitle>Attendees in Meeting</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {attendees.filter((attendee) => attendee.status === "in meeting")
              .length > 0 ? (
              attendees
                .filter((attendee) => attendee.status === "in meeting")
                .sort(
                  (a, b) =>
                    new Date(a.currentMeetingStartedAt).getTime() -
                    new Date(b.currentMeetingStartedAt).getTime()
                )
                .map((attendee) => (
                  <Card key={attendee.id}>
                    <CardHeader>
                      <CardTitle>
                        {attendee.identifier} - {attendee.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div>
                        Started At:{" "}
                        {dayjs(attendee.currentMeetingStartedAt).format(
                          "hh:mm A"
                        )}
                      </div>

                      <div>
                        Time Remaining:{" "}
                        {renderTimeLeft(attendee.currentMeetingStartedAt, time)}
                        <Button
                          onClick={() => {
                            let vendorId = attendee.currentMeetingVendorId;
                            let attendeeId = attendee.id;

                            endMeeting(vendorId, attendeeId);
                          }}
                        >
                          End Meeting
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <p>No Attendees in meeting</p>
            )}
          </CardContent>
        </Card> */}
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
                  <Card
                    key={attendee.id}
                    onClick={() => {
                      handleOpenMeetingAssignemntDialog(attendee);
                    }}
                  >
                    <CardHeader>
                      <CardTitle>
                        {attendee.identifier} - {attendee.name}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
            </CardContent>
          </Card>
        </div>
        <Separator orientation="vertical" />
        <div>
          <h2 className="text-xl font-bold mb-5">Current Meetings and Queue</h2>
          <QueueManagement eventId={eventId} />
        </div>
      </div>
    </div>
  );
}
