import { useMeetings } from "@/app/_hooks/meetings";
import { useQueue } from "@/app/_hooks/queue";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { IAttendee, IVendorInEvent } from "@/types";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export function MeetingAssignmentDialog({
  isOpen,
  handleClose,
  attendee,
  vendors,
  eventId,
}: {
  isOpen: boolean;
  handleClose: () => void;
  attendee: IAttendee;
  vendors: IVendorInEvent[];
  eventId: string;
}) {
  const [selectedVendor, setSelectedVendor] = useState<IVendorInEvent | null>(
    null
  );
  const [buzzerNumber, setBuzzerNumber] = useState(""); // New state for buzzer number

  const { meetings, assignAttendee } = useMeetings(eventId);
  const { queue, queueAttendee } = useQueue(eventId);

  const assignToVendor = async (
    vendor: IVendorInEvent,
    attendee: IAttendee
  ) => {
    await assignAttendee(vendor, attendee, buzzerNumber); // Pass buzzer number
    setSelectedVendor(null);
    setBuzzerNumber(""); // Reset buzzer number after assignment
    handleClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        handleClose();
        setSelectedVendor(null);
      }}
    >
      <DialogContent>
        <DialogTitle>
          Assign or Queue{" "}
          <span className="italic">
            {attendee?.identifier} - {attendee?.name}
          </span>{" "}
          to a vendor
        </DialogTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-[200px] justify-between",
                !selectedVendor?.id && "text-muted-foreground"
              )}
            >
              {selectedVendor
                ? vendors.find((vendor) => vendor.id === selectedVendor.id)
                    ?.name
                : "Select attendee"}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search vendors..." className="h-9" />
              <CommandEmpty>No vendors found.</CommandEmpty>
              <CommandGroup>
                {vendors.map((vendor) => {
                  // Check if the attendee has already met the vendor
                  const hasMetVendor = meetings.some(
                    (meeting) =>
                      meeting.attendeeId === attendee?.id &&
                      meeting.vendorId === vendor.id &&
                      meeting.meetingEndedAt !== null // Past meeting
                  );

                  // Check if the attendee is queued for the vendor
                  const isQueuedWithVendor = queue.some(
                    (q) =>
                      q.attendee.id === attendee?.id && q.vendorId === vendor.id
                  );

                  return (
                    <CommandItem
                      value={vendor.id}
                      key={vendor.id}
                      onSelect={() => {
                        setSelectedVendor(vendor);
                      }}
                      disabled={hasMetVendor || isQueuedWithVendor} // Disable if already met or queued
                    >
                      {vendor.name}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          vendor.id === selectedVendor?.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedVendor && (
          <>
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
              onClick={() => assignToVendor(selectedVendor, attendee)}
              disabled={!buzzerNumber}
            >
              Assign with Buzzer
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
