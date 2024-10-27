import { useMeetings } from "@/app/_hooks/meetings";
import { useQueue } from "@/app/_hooks/queue";
import { useTimerTick } from "@/app/_hooks/timerTick";
import { renderTimeLeft } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IAttendee, IVendorInEvent } from "@/types";
import dayjs from "dayjs";
import { useMemo } from "react";

export function VendorQueue({
  vendor,
  attendees,
  eventId,
}: {
  vendor: IVendorInEvent;
  attendees: Array<IAttendee>;
  eventId: string;
}) {
  // console.log(vendor);
  const { time } = useTimerTick();
  const { meetings, assignAttendee, endMeeting } = useMeetings(eventId);
  const { queue } = useQueue(eventId);
  const ongoingVendorMeetings = useMemo(() => {
    console.log("@@@ MEETINGS", meetings);
    return meetings.filter(
      (meeting) =>
        meeting.vendorId === vendor.id && meeting.meetingEndedAt === null
    );
  }, [meetings, vendor.id]);
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <h3 className="text-xl font-bold">{vendor.name}</h3>
      </CardHeader>
      <CardContent>
        <h3 className="font-light mb-5">
          Current Meetings: {ongoingVendorMeetings.length}/{vendor.slots}
        </h3>
        <div className="flex flex-col gap-5">
          {ongoingVendorMeetings.length > 0 ? (
            ongoingVendorMeetings
              .sort(
                (a, b) =>
                  new Date(a.meetingStartedAt).getTime() -
                  new Date(b.meetingStartedAt).getTime()
              )
              .map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <CardTitle>
                      {meeting.attendeeIdentifier} - {meeting.attendeeName}
                      <div className="text-xs">
                        Meeting started at{" "}
                        <span className="font-bold">
                          {" "}
                          {dayjs(meeting.meetingStartedAt).format("hh:mm A")}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div>
                      <p className="pb-6">
                        {/* Time Remaining:{" "} */}
                        {renderTimeLeft(meeting.meetingStartedAt, time)}
                      </p>
                      <Button
                        onClick={() => {
                          endMeeting(meeting.id);
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
          <Separator orientation="horizontal" />
          {queue.filter(
            (queuedAttendee) => queuedAttendee.vendorId === vendor.id
          ).length > 0 ? ( // Check if there are attendees in the queue for this vendor
            <div className="flex flex-col gap-5">
              <h3 className="font-light mb-1">Queue</h3>
              {queue
                .filter(
                  (queuedAttendee) => queuedAttendee.vendorId === vendor.id
                )
                .map((queuedAttendee) => (
                  <Card key={queuedAttendee.id}>
                    <CardHeader>
                      <CardTitle>
                        {queuedAttendee.attendee.identifier} -{" "}
                        {queuedAttendee.attendee.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div>
                        Queued At:{" "}
                        {dayjs(queuedAttendee.queuedAt).format("hh:mm A")}
                      </div>
                      <Button
                        onClick={() => {
                          assignAttendee(
                            vendor,
                            queuedAttendee.attendee,
                            queuedAttendee.buzzerNumber
                          );
                        }}
                      >
                        Assign
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <p>No Attendees in queue</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
