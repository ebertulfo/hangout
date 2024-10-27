import { useMeetings } from "@/app/_hooks/meetings";
import { useQueue } from "@/app/_hooks/queue";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { IAttendee, IVendorInEvent } from "@/types";
import { StarIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";

export function QueueAttendeeDialog({
  isOpen,
  handleClose,
  attendee,
  vendors,
  eventId,
}: {
  isOpen: boolean;
  handleClose: () => void;
  attendee: IAttendee | null;
  vendors: IVendorInEvent[];
  eventId: string;
}) {
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(
    new Set()
  );
  const [buzzerNumber, setBuzzerNumber] = useState(""); // New state for buzzer number
  const { queue, queueAttendee, dequeueAttendee } = useQueue(eventId);
  const { meetings } = useMeetings(eventId);

  // Memoize vendor statuses
  const vendorStatuses = useMemo(() => {
    if (!attendee) return {};
    const status: Record<string, string> = {};
    vendors.forEach((vendor) => {
      const isQueued = queue.some(
        (q) => q.attendee.id === attendee.id && q.vendorId === vendor.id
      );
      const isInMeeting = meetings.some(
        (meeting) =>
          meeting.attendeeId === attendee.id &&
          meeting.vendorId === vendor.id &&
          !meeting.meetingEndedAt
      );
      const hasMetBefore = meetings.some(
        (meeting) =>
          meeting.attendeeId === attendee.id &&
          meeting.vendorId === vendor.id &&
          meeting.meetingEndedAt
      );

      if (hasMetBefore) {
        status[vendor.id] = "Already met";
      } else if (isInMeeting) {
        status[vendor.id] = "In meeting";
      } else if (isQueued) {
        status[vendor.id] = "Already queued";
      } else {
        status[vendor.id] = "Available";
      }
    });
    return status;
  }, [attendee, queue, meetings, vendors]);

  if (!attendee) {
    return null; // Return early if no attendee data is available
  }

  const toggleVendorSelection = (vendorId: string) => {
    setSelectedVendors((prevSelected) => {
      const updatedSelection = new Set(prevSelected);
      if (updatedSelection.has(vendorId)) {
        updatedSelection.delete(vendorId);
      } else {
        updatedSelection.add(vendorId);
      }
      return updatedSelection;
    });
  };

  const queueSelectedVendors = () => {
    selectedVendors.forEach((vendorId) => {
      queueAttendee(attendee, vendorId, buzzerNumber); // Pass buzzer number
    });
    setSelectedVendors(new Set());
    setBuzzerNumber(""); // Reset buzzer number after queuing
    handleClose();
  };

  const removeFromQueue = (vendorId: string) => {
    dequeueAttendee(attendee.id, vendorId);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        handleClose();
        setSelectedVendors(new Set());
        setBuzzerNumber(""); // Reset buzzer number when closing
      }}
    >
      <DialogContent>
        <DialogTitle>
          Manage Queue for{" "}
          <span className="italic">
            {attendee.identifier} - {attendee.name}
          </span>
        </DialogTitle>

        <div className="mb-4">
          <p>Select vendors to add to queue:</p>
          {vendors.map((vendor) => {
            const status = vendorStatuses[vendor.id];
            const isAvailable = status === "Available";
            const isSelected = selectedVendors.has(vendor.id);
            const isPreferred = attendee.preferredVendors?.includes(vendor.id);

            return (
              <label key={vendor.id} className="flex items-center my-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleVendorSelection(vendor.id)}
                  disabled={!isAvailable}
                />
                <span className="ml-2">
                  {vendor.name}{" "}
                  {isPreferred && (
                    <StarIcon className="text-yellow-500 ml-1 inline-block" />
                  )}
                  {!isAvailable && (
                    <span className="text-sm text-gray-500">({status})</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>

        {/* Buzzer Number Input */}
        <label className="block mt-4">
          <span className="text-sm">Buzzer Number</span>
          <input
            type="text"
            value={buzzerNumber}
            onChange={(e) => setBuzzerNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Enter buzzer number"
          />
        </label>

        <Button
          onClick={queueSelectedVendors}
          disabled={!selectedVendors.size || !buzzerNumber}
        >
          Queue Selected Vendors
        </Button>

        <div className="mt-6">
          <h3 className="text-lg font-semibold">Current Queue</h3>
          {queue.length ? (
            <ul>
              {queue
                .filter((q) => q.attendee.id === attendee.id)
                .map((queuedItem) => {
                  const vendor = vendors.find(
                    (v) => v.id === queuedItem.vendorId
                  );
                  return (
                    <li
                      key={queuedItem.vendorId}
                      className="flex justify-between items-center my-2"
                    >
                      <span>{vendor?.name}</span>
                      <Button
                        variant="destructive"
                        onClick={() => removeFromQueue(queuedItem.vendorId)}
                      >
                        Remove from Queue
                      </Button>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p>No queued vendors for this attendee.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
