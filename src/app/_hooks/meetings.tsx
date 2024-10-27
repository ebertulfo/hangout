// A hook that handles meeting related operations

import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase/firebase";
import { IAttendee, IExistingMeeting, IMeeting, IVendorInEvent } from "@/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
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

  // Toggle buzz status for each stage
  const toggleBuzzNotification = async (meetingId: string, stage: string) => {
    const meetingRef = doc(db, "events", eventId, "meetings", meetingId);
    let fieldToUpdate;
    let currentStatus;

    switch (stage) {
      case "10-minute":
        fieldToUpdate = "tenMinuteBuzzed";
        currentStatus = meetings.find(
          (m) => m.id === meetingId
        )?.tenMinuteBuzzed;
        break;
      case "5-minute":
        fieldToUpdate = "fiveMinuteBuzzed";
        currentStatus = meetings.find(
          (m) => m.id === meetingId
        )?.fiveMinuteBuzzed;
        break;
      case "time-up":
        fieldToUpdate = "timeUpBuzzed";
        currentStatus = meetings.find((m) => m.id === meetingId)?.timeUpBuzzed;
        break;
      default:
        return;
    }

    await updateDoc(meetingRef, {
      [fieldToUpdate]: !currentStatus, // Toggle the status
    });

    toast({
      title: `${stage.replace("-", " ")} buzz ${
        !currentStatus ? "sent" : "undone"
      }`,
    });
  };

  const markAsFollowedUp = async (meetingId: string) => {
    const meetingRef = doc(db, "events", eventId, "meetings", meetingId);
    await updateDoc(meetingRef, {
      followUpCompletedAt: new Date().toISOString(),
    });
    toast({
      title: "Follow-up marked as complete",
    });
  };

  const assignAttendee = async (
    vendor: IVendorInEvent,
    attendee: IAttendee,
    buzzerNumber: string
  ) => {
    let attendeeInMeeting = meetings.find(
      (meeting) => meeting.attendeeId === attendee.id && !meeting.meetingEndedAt
    );
    if (attendeeInMeeting) {
      toast({
        title: "Attendee is already in a meeting",
        variant: "destructive",
      });
      return;
    }
    let attendeeMeetingsWithVendor = meetings.filter(
      (meeting) =>
        meeting.attendeeId === attendee.id && meeting.vendorId === vendor.id
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

    const attendeeRef = doc(db, "events", eventId, "attendees", attendee.id);
    await updateDoc(attendeeRef, {
      status: "in meeting",
      currentMeetingVendorId: vendor.id,
      currentMeetingStartedAt: dayjs.extend(utc).utc().format(),
    });
    console.log("@@ BUZZER NUMBER", buzzerNumber);
    const meetingsRef = collection(db, "events", eventId, "meetings");
    const newMeeting: IMeeting = {
      vendorId: vendor.id,
      attendeeId: attendee.id,
      attendeeIdentifier: attendee.identifier,
      attendeeName: attendee.name,
      buzzerNumber: buzzerNumber, // Store buzzer number
      meetingStartedAt: dayjs.extend(utc).utc().format(),
      meetingEndedAt: null,
    };
    await addDoc(meetingsRef, newMeeting);
    // Remove attendee from the queue if they are there, using nested field query
    const queueRef = collection(db, "events", eventId, "queue");
    const q = query(queueRef, where("attendee.id", "==", attendee.id));
    const queueSnapshot = await getDocs(q);
    queueSnapshot.forEach((doc) => {
      deleteDoc(doc.ref); // Delete the document from the queue collection
    });
    toast({
      title: `Attendee assigned with buzzer ${buzzerNumber}`,
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
    toggleBuzzNotification,
    markAsFollowedUp,
  };
};
