import { useQueue } from "@/app/_hooks/queue";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { IAttendee, IVendorInEvent } from "@/types";
import { useState } from "react";

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
  const { queue, queueAttendee, dequeueAttendee } = useQueue(eventId);

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
      queueAttendee(attendee.id, attendee.name, attendee.identifier, vendorId);
    });
    setSelectedVendors(new Set());
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
            const isQueued = !!queue.find(
              (q) => q.attendeeId === attendee.id && q.vendorId === vendor.id
            );
            const isSelected = selectedVendors.has(vendor.id);

            return (
              <label key={vendor.id} className="flex items-center my-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleVendorSelection(vendor.id)}
                  disabled={isQueued}
                />
                <span className="ml-2">
                  {vendor.name} {isQueued ? "(Already queued)" : ""}
                </span>
              </label>
            );
          })}
        </div>

        <Button onClick={queueSelectedVendors} disabled={!selectedVendors.size}>
          Queue Selected Vendors
        </Button>

        <div className="mt-6">
          <h3 className="text-lg font-semibold">Current Queue</h3>
          {queue.length ? (
            <ul>
              {queue
                .filter((q) => q.attendeeId === attendee.id)
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
