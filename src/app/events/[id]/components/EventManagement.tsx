"use client";
import { useAttendees } from "@/app/_hooks/attendees";
import { useTimerTick } from "@/app/_hooks/timerTick";
import { useVendor } from "@/app/_hooks/vendors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebase/firebase";
import { IAttendee, IExistingEvent } from "@/types";
import dayjs from "dayjs";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddAttendeeDialog from "./attendee/AddAttendeeDialog";
import { AttendeesTable } from "./attendee/AttendeesTable";
import { MeetingManagement } from "./meetings/MeetingsManagement";
import { RSVPsTable } from "./rsvps/RSVPsTable";
import { UploadRSVP } from "./rsvps/UploadRSVP";
import AddVendorDialog from "./vendor/AddVendorDialog";
import VendorCard from "./vendor/VendorCard";

export default function EventManagement() {
  const { id }: { id: string } = useParams();
  const { attendees } = useAttendees(id);
  const { vendors } = useVendor(id);
  const [event, setEvent] = useState<IExistingEvent>();

  const [openMeetingAssignmentDialog, setOpenMeetingAssignmentDialog] =
    useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<IAttendee | null>(
    null
  );
  const { time } = useTimerTick();

  useEffect(() => {
    // Get event from firestore
    if (id) {
      const eventDocRef = doc(db, "events", id as string);
      getDoc(eventDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data: IExistingEvent = docSnap.data() as IExistingEvent;
          data.date = dayjs(new Date(data.date)).format("MMMM D, YYYY");
          setEvent({ ...data, id });
        }
      });
    }
  }, [id]);

  return event ? (
    <main className="flex flex-row gap-5 m-5">
      {/* <AssignAttendeeDialog
        isOpen={openMeetingAssignmentDialog}
        // attendee={selectedAttendee}
        vendors={vendors}
        eventId={id}
      /> */}
      <Tabs defaultValue="vendors" className="w-full">
        <TabsList>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="rsvps">RSVPs</TabsTrigger>
        </TabsList>
        <TabsContent value="vendors">
          <div>
            <h1>
              {event?.name} - {event?.location} {event?.date}
            </h1>
            {event && <AddVendorDialog event={event} />}
            <h2>Event Vendors</h2>
            <div className={"flex gap-10"}>
              {vendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  eventId={event.id}
                  vendor={vendor}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="meetings">
          <MeetingManagement vendors={vendors} eventId={event.id} />
        </TabsContent>
        <TabsContent value="attendees">
          <div>
            <h2>Event Attendees</h2>
            <AddAttendeeDialog
              eventId={event.id}
              attendeesCount={attendees.length}
            />
            <AttendeesTable eventId={event.id} attendees={attendees} />
          </div>
        </TabsContent>
        <TabsContent value="rsvps">
          <h2 className="text-xl pb-2">Event RSVPs</h2>

          <RSVPsTable eventId={event.id} />
          <UploadRSVP eventId={event.id} />
        </TabsContent>
      </Tabs>
    </main>
  ) : (
    "Please wait..."
  );
}
