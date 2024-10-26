// A hook that handles meeting related operations

import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase/firebase";
import { IAttendee, IExistingMeeting, IMeeting, IVendorInEvent } from "@/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAttendees } from "./attendees";
export const useMeetings = (eventId: string) => {
  const { toast } = useToast();
  const { attendees } = useAttendees(eventId);
  const [meetings, setMeetings] = useState<IExistingMeeting[]>([]);

  useEffect(() => {
    // Create realtime connection for the event's vendors
    const unsubMeetings = onSnapshot(
      collection(db, "events", eventId as string, "meetings"),
      (snapshot) => {
        const newMeetings: IExistingMeeting[] = [];
        snapshot.forEach((doc) => {
          newMeetings.push({ ...doc.data(), id: doc.id } as IExistingMeeting);
        });
        setMeetings(newMeetings);
      }
    );

    return () => {
      unsubMeetings();
    };
  }, [eventId]);

  const assignAttendee = async (
    vendor: IVendorInEvent,
    attendee: IAttendee
  ) => {
    let attendeeMeetingsWithVendor = meetings.filter(
      (meeting) =>
        meeting.attendeeId === attendee.id && meeting.vendorId === vendor.id
    );
    console.log(
      "@@@ Attendee Meetings with Vendor",
      attendeeMeetingsWithVendor
    );
    if (attendeeMeetingsWithVendor.length) {
      toast({
        title: "Attendee is already in a meeting / Has already met the vendor",
        variant: "destructive",
      });
      return;
    }

    let vendorOngoingMeeting = meetings.filter((meeting) => {
      return meeting.vendorId === vendor.id && !meeting.meetingEndedAt;
    });
    if (vendorOngoingMeeting.length >= vendor.slots) {
      toast({
        title: "Vendor is at full capacity.",
        description:
          "Pleas ask the attendee if they want to queue or meet another vendor.",
        variant: "destructive",
      });
      return;
    }

    console.log("@@@ Assigning attendee", eventId, vendor.id, attendee.id);
    const attendeeRef = doc(db, "events", eventId, "attendees", attendee.id);
    await updateDoc(attendeeRef, {
      status: "in meeting",
      currentMeetingVendorId: vendor.id,
      currentMeetingStartedAt: dayjs.extend(utc).utc().format(),
    });
    const meetingsRef = collection(db, "events", eventId, "meetings");
    const newMeeting: IMeeting = {
      vendorId: vendor.id,
      attendeeId: attendee.id,
      attendeeIdentifier: attendee.identifier,
      attendeeName: attendee.name,
      meetingStartedAt: dayjs.extend(utc).utc().format(),
      meetingEndedAt: null,
    };
    await addDoc(meetingsRef, newMeeting);
    toast({
      title: "Attendee assigned",
    });
  };
  const endMeeting = async (meetingId: string) => {
    const confirm = window.confirm("Are you sure you want to end the meeting?");
    if (!confirm) return;
    console.log(
      "Ending meeting",
      "event ID: ",
      eventId,
      "meetingId:",
      meetingId
    );
    const meetingRef = doc(db, "events", eventId, "meetings", meetingId);
    const meetingData = await getDoc(meetingRef);
    const meeting = meetingData.data() as IMeeting;

    await updateDoc(meetingRef, {
      meetingEndedAt: dayjs.extend(utc).utc().format(),
    });
    const attendeeRef = doc(
      db,
      "events",
      eventId,
      "attendees",
      meeting.attendeeId
    );
    await updateDoc(attendeeRef, {
      status: "unassigned",
      currentMeetingVendorId: null,
    });
    toast({
      title: "Meeting Ended",
    });
  };

  // Add other CRUD operations here
  const updateMeeting = async (meetingId: string, values: object) => {
    let meetingRef = doc(db, "events", eventId, "meetings", meetingId);
    await updateDoc(meetingRef, {
      ...values,
    });
  };
  return {
    meetings,
    endMeeting,
    assignAttendee,
    updateMeeting,
  };
};
