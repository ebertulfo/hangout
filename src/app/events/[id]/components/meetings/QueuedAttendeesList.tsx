import { useMeetings } from "@/app/_hooks/meetings";
import { useQueue } from "@/app/_hooks/queue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IAttendee, IVendorInEvent } from "@/types";
import { useState } from "react";

export function QueuedAttendeesList({
  eventId,
  vendors,
}: {
  eventId: string;
  vendors: IVendorInEvent[];
}) {
  const { queue } = useQueue(eventId);
  const { meetings, assignAttendee } = useMeetings(eventId);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<IAttendee | null>(
    null
  );
  const [selectedVendor, setSelectedVendor] = useState<IVendorInEvent | null>(
    null
  );
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<
    string | "all"
  >("all");

  // Determine if each vendor has open slots
  const vendorOpenSlots = vendors.reduce((acc, vendor) => {
    const activeMeetings = meetings.filter(
      (meeting) =>
        meeting.vendorId === vendor.id && meeting.meetingEndedAt === null
    ).length;
    acc[vendor.id] = activeMeetings < vendor.slots;
    return acc;
  }, {} as Record<string, boolean>);

  // Group queue by attendee instead of vendor
  const queueByAttendee: Record<
    string,
    {
      attendee: IAttendee;
      vendors: {
        vendor: IVendorInEvent;
        position: number;
        buzzerNumber: string | null;
      }[];
    }
  > = {};
  queue.forEach(({ attendee, vendorId, buzzerNumber }) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return;

    if (!queueByAttendee[attendee.id]) {
      queueByAttendee[attendee.id] = {
        attendee,
        vendors: [],
      };
    }

    // Find the attendee's position in the vendor queue
    const position =
      queue
        .filter((entry) => entry.vendorId === vendorId)
        .sort(
          (a, b) =>
            new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
        )
        .findIndex((entry) => entry.attendee.id === attendee.id) + 1;

    queueByAttendee[attendee.id].vendors.push({
      vendor,
      position,
      buzzerNumber: buzzerNumber || "N/A", // Display "N/A" if no buzzer number
    });
  });

  const handleAssign = async (
    attendee: IAttendee,
    vendor: IVendorInEvent,
    buzzerNumber: string,
    isOverride = false
  ) => {
    const attendeeIsFirstInLine = queueByAttendee[attendee.id].vendors.some(
      (v) => v.vendor.id === vendor.id && v.position === 1
    );

    if (!isOverride && !attendeeIsFirstInLine) {
      // If attendee is not first in line and it's not an override, open confirmation dialog
      setSelectedAttendee(attendee);
      setSelectedVendor(vendor);
      setOverrideDialogOpen(true);
    } else {
      // Proceed with assignment, including buzzer number
      await assignAttendee(vendor, attendee, buzzerNumber);
    }
  };

  const confirmOverrideAssign = async () => {
    if (selectedAttendee && selectedVendor) {
      // Retrieve buzzer number from the queue entry
      const { buzzerNumber } = queue.find(
        (q) =>
          q.attendee.id === selectedAttendee.id &&
          q.vendorId === selectedVendor.id
      ) || { buzzerNumber: null };

      if (buzzerNumber) {
        await assignAttendee(selectedVendor, selectedAttendee, buzzerNumber);
      }

      setOverrideDialogOpen(false);
      setSelectedAttendee(null);
      setSelectedVendor(null);
    }
  };

  // Filter by selected vendor
  const filteredAttendees =
    selectedVendorFilter === "all"
      ? Object.values(queueByAttendee)
      : Object.values(queueByAttendee).filter((entry) =>
          entry.vendors.some((v) => v.vendor.id === selectedVendorFilter)
        );

  return (
    <TooltipProvider>
      <div className="flex-row space-y-4">
        <h3 className="text-xl font-bold">Queued Attendees</h3>

        {/* Vendor Filter Dropdown */}
        <div className="mb-4">
          <label
            htmlFor="vendorFilter"
            className="block text-sm font-medium text-gray-700"
          >
            Filter by Vendor:
          </label>
          <select
            id="vendorFilter"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            value={selectedVendorFilter}
            onChange={(e) => setSelectedVendorFilter(e.target.value)}
          >
            <option value="all">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Check if there are filtered attendees */}
        <Card className="w-[400px] space-y-4">
          {filteredAttendees.length > 0 ? (
            <CardContent className="flex flex-col gap-4">
              {filteredAttendees.map(({ attendee, vendors }) => (
                <Card key={attendee.id} className="p-4 shadow-md space-y-2">
                  <CardHeader>
                    <CardTitle>
                      {attendee.identifier} - {attendee.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-700">Queued for:</p>
                    <div className="space-y-2">
                      {vendors.map(({ vendor, position, buzzerNumber }) => (
                        <div
                          key={vendor.id}
                          className="flex items-center gap-2"
                        >
                          <Badge
                            variant={
                              vendorOpenSlots[vendor.id]
                                ? "secondary"
                                : "destructive"
                            }
                            className="px-2 py-1"
                          >
                            {vendor.name}{" "}
                            {vendorOpenSlots[vendor.id]
                              ? "(Slot Available)"
                              : "(Full)"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Position {position} in queue
                          </span>
                          <span className="text-sm text-gray-700">
                            Buzzer #{buzzerNumber}
                          </span>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={position === 1 ? "default" : "outline"}
                                className={
                                  position === 1
                                    ? "bg-blue-500 text-white"
                                    : "opacity-60"
                                }
                                disabled={!vendorOpenSlots[vendor.id]}
                                onClick={() =>
                                  handleAssign(attendee, vendor, buzzerNumber)
                                }
                              >
                                Assign
                              </Button>
                            </TooltipTrigger>
                            {position !== 1 && (
                              <TooltipContent>
                                Assigning will override queue order.
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          ) : (
            // Empty message if no attendees are in the queue
            <p className="text-center text-gray-500 m-4">
              No attendees are currently queued
              {selectedVendorFilter !== "all" &&
                ` for ${
                  vendors.find((v) => v.id === selectedVendorFilter)?.name
                }`}
              .
            </p>
          )}
        </Card>

        {/* Confirmation Dialog for Override */}
        <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
          <DialogContent>
            <DialogTitle>Confirm Override</DialogTitle>
            <p>
              This attendee is not the first in line. Are you sure you want to
              assign them out of order?
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOverrideDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmOverrideAssign}>
                Confirm Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
