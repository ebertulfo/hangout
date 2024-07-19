import { useMeetings } from "@/app/_hooks/Meetings";
import { useQueue } from "@/app/_hooks/Queue";
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

  const { assignAttendee } = useMeetings(eventId);
  const { add } = useQueue(eventId);

  const assignToVendor = async (
    vendor: IVendorInEvent,
    attendee: IAttendee
  ) => {
    console.log("Assigning attendee", eventId, vendor.id, attendee.id);
    await assignAttendee(vendor, attendee);
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
                {vendors.map((vendor) => (
                  <CommandItem
                    value={vendor.id}
                    key={vendor.id}
                    onSelect={() => {
                      setSelectedVendor(vendor);
                    }}
                    disabled={
                      !!vendor.meetings?.find(
                        (meeting) =>
                          meeting.attendeeId === attendee?.id &&
                          meeting.meetingEndedAt !== null
                      )
                    }
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
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedVendor &&
          (selectedVendor?.meetings.filter(
            (meeting) => meeting.meetingEndedAt === null
          ).length < selectedVendor.slots ? (
            <>
              <Button onClick={() => assignToVendor(selectedVendor, attendee)}>
                Assign to {selectedVendor?.name}
              </Button>
            </>
          ) : (
            <>
              <p>All vendor&apos;s slots currently occupied</p>
              <Button
                onClick={() =>
                  add(
                    attendee.id,
                    attendee.name,
                    attendee.identifier,
                    selectedVendor.id
                  )
                }
              >
                Queue for {selectedVendor?.name}
              </Button>
            </>
          ))}
      </DialogContent>
    </Dialog>
  );
}
