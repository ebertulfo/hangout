import { useAttendees } from "@/app/_hooks/attendees";
import { useMeetings } from "@/app/_hooks/meetings";
import { useQueue } from "@/app/_hooks/queue";
import { useVendor } from "@/app/_hooks/vendors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IAttendee } from "@/types";
import { useMemo, useState } from "react";

export function UnassignedAttendeesList({
  eventId,
  openMeetingsDialog,
  openQueueDialog,
}: {
  eventId: string;
  openMeetingsDialog: (attendee: IAttendee) => void;
  openQueueDialog: (attendee: IAttendee) => void;
}) {
  const { attendees, updateAttendee } = useAttendees(eventId);
  const { meetings } = useMeetings(eventId);
  const { queue } = useQueue(eventId);
  const { vendors } = useVendor(eventId);
  const [unassignedAttendeesSearch, setUnassignedAttendeesSearch] =
    useState("");

  // State for confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<IAttendee | null>(
    null
  );

  const excludedAttendeeIds = useMemo(() => {
    const inMeetingAttendees = meetings
      .filter((meeting) => meeting.meetingEndedAt === null)
      .map((meeting) => meeting.attendeeId);

    const queuedAttendees = queue.map((q) => q.attendee.id);

    return new Set([...inMeetingAttendees, ...queuedAttendees]);
  }, [meetings, queue]);

  const vendorNameById = useMemo(() => {
    return vendors?.reduce((map, vendor) => {
      map[vendor.id] = vendor.name;
      return map;
    }, {} as Record<string, string>);
  }, [vendors]);

  const metVendorsByAttendee = useMemo(() => {
    const metVendorsMap: Record<string, string[]> = {};

    meetings.forEach((meeting) => {
      if (meeting.meetingEndedAt) {
        if (!metVendorsMap[meeting.attendeeId]) {
          metVendorsMap[meeting.attendeeId] = [];
        }
        if (!metVendorsMap[meeting.attendeeId].includes(meeting.vendorId)) {
          metVendorsMap[meeting.attendeeId].push(meeting.vendorId);
        }
      }
    });

    return metVendorsMap;
  }, [meetings]);

  const markAsLeft = async (attendeeId: string) => {
    await updateAttendee(attendeeId, { status: "left" });
    setConfirmDialogOpen(false); // Close dialog after marking as left
  };

  const handleMarkAsLeftClick = (attendee: IAttendee) => {
    setSelectedAttendee(attendee);
    setConfirmDialogOpen(true); // Open confirmation dialog
  };

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.status === "unassigned" &&
      !excludedAttendeeIds.has(attendee.id) &&
      (attendee.identifier
        .toLowerCase()
        .includes(unassignedAttendeesSearch.toLowerCase()) ||
        attendee.name
          .toLowerCase()
          .includes(unassignedAttendeesSearch.toLowerCase()))
  );

  return (
    <div className="flex-row">
      <h3 className="text-xl font-bold mb-5">Unassigned Attendees</h3>
      <Card className="min-w-[375px] max-w-[375px]">
        <CardHeader>
          <Input
            placeholder="Search Identifier or Name"
            onChange={(e) => {
              setUnassignedAttendeesSearch(e.target.value);
            }}
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {filteredAttendees.map((attendee) => {
            const metVendorIds = metVendorsByAttendee[attendee.id] || [];
            const unmetVendors = vendors.filter(
              (vendor) => !metVendorIds.includes(vendor.id)
            );
            const isCompleted = metVendorIds.length === vendors.length;

            return (
              <Card key={attendee.id}>
                <CardHeader>
                  <CardTitle>
                    {attendee.identifier} - {attendee.name}
                  </CardTitle>
                  {isCompleted && (
                    <Badge variant="secondary" className="mt-2">
                      Completed
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-600">
                    Met:{" "}
                    <div className="flex flex-wrap gap-1">
                      {metVendorIds.length ? (
                        metVendorIds
                          .filter((vendorId) => vendorNameById[vendorId])
                          .map((vendorId) => (
                            <Badge key={vendorId}>
                              {vendorNameById[vendorId]}
                            </Badge>
                          ))
                      ) : (
                        <span>None</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Unmet:{" "}
                    <div className="flex flex-wrap gap-1">
                      {unmetVendors.length ? (
                        unmetVendors.map((vendor) => (
                          <Badge
                            key={vendor.id}
                            variant="outline"
                            className="mr-1"
                          >
                            {vendor.name}
                          </Badge>
                        ))
                      ) : (
                        <span>None</span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={() => openMeetingsDialog(attendee)}
                    className="text-primary-foreground"
                  >
                    Assign
                  </Button>
                  <Button
                    onClick={() => openQueueDialog(attendee)}
                    className="text-primary-foreground"
                  >
                    Queue
                  </Button>
                  <Button
                    onClick={() => handleMarkAsLeftClick(attendee)}
                    variant="destructive"
                  >
                    Mark as Left
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogTitle>Confirm Leaving</DialogTitle>
          <p>
            Are you sure you want to mark{" "}
            <span className="font-semibold">{selectedAttendee?.name}</span> as
            &quot;Left the event&quot;?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => markAsLeft(selectedAttendee?.id!)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
