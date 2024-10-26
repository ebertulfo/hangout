import { useAttendees } from "@/app/_hooks/attendees";
import { useMeetings } from "@/app/_hooks/meetings";
import { useTimerTick } from "@/app/_hooks/timerTick";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase/firebase";
import { IVendorInEvent } from "@/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { deleteDoc, doc } from "firebase/firestore";
import { useMemo } from "react";
import AssignAttendeeDialog from "./AssignAttendeeDialog";
import EditVendorDialog from "./EditVendorDialog";
dayjs.extend(utc);
export default function VendorCard({
  vendor,
  eventId,
}: {
  vendor: IVendorInEvent;
  eventId: string;
}) {
  const { toast } = useToast();
  const { endMeeting } = useMeetings(eventId);
  const { time } = useTimerTick();
  const { attendees } = useAttendees(eventId);
  const { meetings } = useMeetings(eventId);

  const vendorMeetings = useMemo(
    () => meetings.filter((meeting) => meeting.vendorId === vendor.id),
    [meetings, vendor.id]
  );

  const ongoingMeetings = useMemo(() => {
    return vendorMeetings.filter((meeting) => meeting.meetingEndedAt === null);
  }, [vendorMeetings]);

  const deleteVendor = async (eventId: string, vendorId: string) => {
    console.log(vendor);
    console.log("Deleting vendor", "events", eventId, "vendors", vendorId);
    const vendorRef = doc(db, "events", eventId, "vendors", vendorId);
    await deleteDoc(vendorRef);

    console.log("Deleted vendor", vendorId);
    toast({
      title: "Event Vendor Deleted",
    });
  };

  const renderTimeLeft = (meetingStartedAt: string) => {
    const timeLeft = dayjs(meetingStartedAt)
      .add(45, "minutes")
      .diff(dayjs(time), "ms", true);
    if (timeLeft <= 0) {
      return "Time's up! Please end the meeting.";
    }
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = ((timeLeft % 60000) / 1000).toFixed(0);
    let fontColor = "text-black";
    if (minutes <= 15) {
      fontColor = "text-orange-500";
    }
    if (minutes <= 5) {
      fontColor = "text-red-500 font-bold";
    }

    return (
      <span className={`${fontColor}`}>
        {minutes} minutes {seconds} seconds
      </span>
    );
  };
  return (
    <Card className="w-96">
      {/* Current Time: {dayjs(time).format("hh:mm:ss")} */}
      <CardHeader>
        <CardTitle className="justify-between flex flex-row align-middle">
          <div>{vendor.name}</div>
          <div className="flex gap-2">
            <EditVendorDialog eventId={eventId} vendor={vendor} />
            <Button onClick={() => deleteVendor(eventId, vendor.id)}>
              Delete
            </Button>
          </div>
        </CardTitle>
        <CardDescription>{vendor.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row justify-between">
          <p className="font-bold">
            Slots: {ongoingMeetings.length}/ {vendor.slots}
          </p>
          <AssignAttendeeDialog
            disabled={ongoingMeetings.length === vendor.slots}
            vendor={vendor}
            eventId={eventId}
          />
        </div>
        <div className="font-semibold text-gray-600 text-sm">
          Had{" "}
          {
            vendorMeetings.filter((meeting) => meeting.meetingEndedAt !== null)
              .length
          }{" "}
          meetings this event
        </div>
        <h3 className="font-bold mb-3">Meetings</h3>

        <div className="font-light flex flex-col gap-8 mb-3">
          {ongoingMeetings.length > 0
            ? ongoingMeetings.map((meeting) => (
                <div
                  className="flex flex-row justify-between align-middle"
                  key={meeting.attendeeId}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {meeting.attendeeIdentifier} - {meeting.attendeeName}{" "}
                    </span>
                    <span>
                      <p className="font-medium">Started At: </p>
                      {meeting.meetingStartedAt &&
                        dayjs(meeting.meetingStartedAt).format("hh:mm A")}
                    </span>
                    <span>
                      <p className="font-medium">Time Remaining:</p>
                      {meeting.meetingStartedAt &&
                        renderTimeLeft(meeting.meetingStartedAt)}
                    </span>
                  </div>
                  <div className="">
                    <Button onClick={() => endMeeting(meeting.id)}>
                      End Meeting
                    </Button>
                  </div>
                </div>
              ))
            : "No ongoing meetings"}
        </div>
      </CardContent>
    </Card>
  );
}
