import { useMeetings } from "@/app/_hooks/Meetings";
import { useQueue } from "@/app/_hooks/Queue";
import { useTimerTick } from "@/app/_hooks/TimerTick";
import { renderTimeLeft } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IAttendee, IVendorInEvent } from "@/types";
import dayjs from "dayjs";

export function VendorQueue({
  vendor,
  attendees,
  eventId,
}: {
  vendor: IVendorInEvent;
  attendees: Array<IAttendee>;
  eventId: string;
}) {
  console.log(vendor);
  const { time } = useTimerTick();
  const { endMeeting } = useMeetings(eventId);
  const { queue } = useQueue(eventId);
  console.log("@@@ Q", queue);
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <h3 className="text-xl font-bold">{vendor.name}</h3>
      </CardHeader>
      <CardContent>
        <h3 className="font-light mb-5">
          Current Meetings:{" "}
          {
            vendor.meetings.filter((meeting) => meeting.meetingEndedAt === null)
              .length
          }
          /{vendor.slots}
        </h3>
        <div className="flex flex-col gap-5">
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
                      <div className="text-xs">
                        Meeting started at{" "}
                        <span className="font-bold">
                          {" "}
                          {dayjs(attendee.currentMeetingStartedAt).format(
                            "hh:mm A"
                          )}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div>
                      <p className="pb-6">
                        {/* Time Remaining:{" "} */}
                        {renderTimeLeft(attendee.currentMeetingStartedAt, time)}
                      </p>
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
                        {queuedAttendee.attendeeIdentifier} -{" "}
                        {queuedAttendee.attendeeName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div>
                        Queued At:{" "}
                        {dayjs(queuedAttendee.queuedAt).format("hh:mm A")}
                      </div>
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
