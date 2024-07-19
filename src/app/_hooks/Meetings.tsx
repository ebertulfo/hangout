// A hook that handles meeting related operations

import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase/firebase";
import { IAttendee, IVendorInEvent } from "@/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { doc, getDoc, updateDoc } from "firebase/firestore";
export const useMeetings = (eventId: string) => {
  const { toast } = useToast();

  const assignAttendee = async (
    vendor: IVendorInEvent,
    attendee: IAttendee
  ) => {
    console.log("Assigning attendee", eventId, vendor.id, attendee.id);
    const attendeeRef = doc(db, "events", eventId, "attendees", attendee.id);
    await updateDoc(attendeeRef, {
      status: "in meeting",
      currentMeetingVendorId: vendor.id,
      currentMeetingStartedAt: dayjs.extend(utc).utc().format(),
    });
    const vendorRef = doc(db, "events", eventId, "vendors", vendor.id);
    const meetings = vendor?.meetings || [];
    await updateDoc(vendorRef, {
      meetings: [
        ...meetings,
        {
          attendeeId: attendee.id,
          attendeeIdentifier: attendee.identifier,
          attendeeName: attendee.name,
          meetingStartedAt: dayjs.extend(utc).utc().format(),
          meetingEndedAt: null,
        },
      ],
    });
    toast({
      title: "Attendee assigned",
    });
  };
  const endMeeting = async (vendorId: string, attendeeId: string) => {
    const confirm = window.confirm("Are you sure you want to end the meeting?");
    if (!confirm) return;
    console.log("Ending meeting", eventId, vendorId, attendeeId);
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

  // Add other CRUD operations here

  return {
    endMeeting,
    assignAttendee,
    // Return other CRUD operations here
  };
};
