import { AttendeesContext } from "@/app/_contexts/AttendeesContext";
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
import { IAttendee, IVendorInEvent, IVendorInEventMeeting } from "@/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
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
  const [time, setTime] = useState(Date.now());
  const attendees: IAttendee[] = useContext(AttendeesContext);
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
  const slots = attendees.filter(
    (attendee) => attendee.currentMeetingVendorId == vendor.id
  ).length;

  const endMeeting = async (vendorId: string, attendeeId: string) => {
    const vendorRef = doc(db, "events", eventId, "vendors", vendorId);
    const vendor = await getDoc(vendorRef);
    const vendorData = vendor.data() as IVendorInEvent;
    const meetings = vendorData.meetings;
    const meeting = meetings.find(
      (meeting) => meeting.attendeeId === attendeeId
    );
    if (!meeting) {
      toast({
        title: "Meeting not found",
      });
      return;
    }
    meeting.meetingEndedAt = dayjs().utc().toISOString();
    await updateDoc(vendorRef, {
      meetings: meetings,
    });
    const attendeeRef = doc(db, "events", eventId, "attendees", attendeeId);
    await updateDoc(attendeeRef, {
      status: "unassigned",
      currentMeetingVendorId: null,
    });
    toast({
      title: "Meeting Ended",
    });
  };
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

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
            Slots: {slots}/ {vendor.slots}
          </p>
          <AssignAttendeeDialog
            disabled={slots === vendor.slots}
            vendor={vendor}
            eventId={eventId}
          />
        </div>
        <h3 className="font-bold mb-5">Meetings</h3>
        <div className="font-light flex flex-col gap-8">
          {vendor.meetings
            ? vendor.meetings
                .filter((meeting) => meeting.meetingEndedAt === null)
                .map((meeting: IVendorInEventMeeting) => (
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
                      <Button
                        onClick={() =>
                          endMeeting(vendor.id, meeting.attendeeId)
                        }
                      >
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
