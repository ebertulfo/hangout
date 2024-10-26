import { useAttendees } from "@/app/_hooks/attendees";
import { useMeetings } from "@/app/_hooks/meetings";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { IVendorInEvent } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
const FormSchema = z.object({
  attendeeId: z.string({
    required_error: "Please select attendee.",
  }),
});
export default function AssignAttendeeDialog({
  vendor,
  disabled,
  eventId,
}: {
  vendor: IVendorInEvent;
  disabled?: boolean;
  eventId: string;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { meetings } = useMeetings(eventId);
  const { attendees } = useAttendees(eventId);
  const { assignAttendee } = useMeetings(eventId);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!data) {
      toast({
        title: "Please select an attendee",
      });
      return;
    }
    // Get the attendee using identifier
    let selectedAttendee = attendees.find(
      (attendee) => attendee.identifier === data.attendeeId
    );
    if (!selectedAttendee) {
      toast({
        title: "Attendee not found",
      });
      return;
    }
    // Assign the attendee to the vendor
    console.log("Assigning attendee", selectedAttendee, "to vendor", vendor);
    await assignAttendee(vendor, selectedAttendee);
    form.reset();
    toast({
      title: "Attendee assignedss",
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger disabled={disabled}>
        <Button disabled={disabled}>Assign</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Assign Attendeeee</DialogTitle>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="attendeeId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Attendees</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? attendees.find(
                                (attendee) =>
                                  attendee.identifier === field.value
                              )?.name
                            : "Select attendee"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search attendees..."
                          className="h-9"
                        />
                        <CommandEmpty>No attendees found.</CommandEmpty>
                        <CommandGroup>
                          {attendees
                            .filter(
                              (attendee) =>
                                ["waiting", "unassigned", null].includes(
                                  attendee.status || null
                                ) &&
                                meetings.filter(
                                  (meeting) =>
                                    meeting.attendeeId === attendee.id
                                ).length === 0
                            )
                            .map((attendee) => (
                              <CommandItem
                                value={attendee.identifier}
                                key={attendee.id}
                                onSelect={() => {
                                  form.setValue(
                                    "attendeeId",
                                    attendee.identifier
                                  );
                                }}
                              >
                                {attendee.identifier} - {attendee.name}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    attendee.id === field.value
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
                  <FormDescription>
                    This attendee will be assigned to vendor{" "}
                    <span className="font-bold">{vendor.name}</span>.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
