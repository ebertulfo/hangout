import { useAttendees } from "@/app/_hooks/attendees";
import { useMeetings } from "@/app/_hooks/meetings";
import { useTimerTick } from "@/app/_hooks/timerTick";
import { Separator } from "@/components/ui/separator";
import { IAttendee, IVendorInEvent } from "@/types";
import { useState } from "react";
import { ForFollowupList } from "./ForFollowupList";
import { MeetingAssignmentDialog } from "./MeetingAssignmentDialog";
import { QueueAttendeeDialog } from "./QueueAttendeeDialog";
import { QueueManagement } from "./QueueManagement";
import { UnassignedAttendeesList } from "./UnassignedAttendeesList";

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

  const [openQueueAttendeeDialog, setOpenQueueAttendeeDialog] = useState(false);

  const handleOpenMeetingAssignemntDialog = (attendee: IAttendee) => {
    setSelectedAttendee(attendee);
    setOpenMeetingAssignmentDialog(true);
  };

  const handleOpenQueueDialog = (attendee: IAttendee) => {
    setSelectedAttendee(attendee);
    setOpenQueueAttendeeDialog(true);
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
      <QueueAttendeeDialog
        isOpen={openQueueAttendeeDialog}
        handleClose={() => setOpenQueueAttendeeDialog(false)}
        attendee={selectedAttendee!}
        vendors={vendors}
        eventId={eventId}
      />
      <h1 className=" text-2xl font-semibold mb-5">Meetings</h1>
      <div className="flex flex-row gap-5">
        <UnassignedAttendeesList
          eventId={eventId}
          openMeetingsDialog={handleOpenMeetingAssignemntDialog}
          openQueueDialog={handleOpenQueueDialog}
        />
        <ForFollowupList eventId={eventId} />
        <Separator orientation="vertical" />
        <div>
          <h2 className="text-xl font-bold mb-5">Current Meetings and Queue</h2>
          <QueueManagement eventId={eventId} />
        </div>
      </div>
    </div>
  );
}
