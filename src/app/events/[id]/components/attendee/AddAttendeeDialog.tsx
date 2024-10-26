import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthContext } from "@/app/_contexts/AuthContext";
import { useAttendees } from "@/app/_hooks/attendees";
import { useRSVPs } from "@/app/_hooks/rsvps";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { IRsvp } from "@/types";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useContext, useState } from "react";

const formSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().email(),
  rsvpId: z.string(),
});

export default function AddAttendeeDialog({
  eventId,
  attendeesCount,
}: {
  eventId: string;
  attendeesCount: number;
}) {
  const { createAttendee } = useAttendees(eventId);
  const { rsvps, updateRSVP } = useRSVPs(eventId);

  const [selectedRsvp, setSelectedRsvp] = useState<IRsvp>();
  const [openDialog, setOpenDialog] = useState(false);
  const user = useContext(AuthContext);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rsvpId: "",
      name: "",
      phoneNumber: "",
      email: "",
    },
  });
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createAttendee({
        ...values,
        identifier: `HO${attendeesCount < 10 && "0"}${attendeesCount + 1}`,
      });
      form.reset();
      setOpenDialog(false);
    } catch (error) {}

    if (selectedRsvp) {
      await updateRSVP(selectedRsvp.id, { attended: true });
    }

    form.reset();
  }
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger>
        <Button>Register Attendee</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register an attendee to the event</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="rsvpId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>RSVPs</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? rsvps.find(
                                  (rsvp) =>
                                    `${rsvp.name} ${rsvp.phone} ${rsvp.email}` ===
                                    field.value
                                )?.name || "Walk-in"
                              : "Select RSVP"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search attendees..."
                            className="h-9"
                          />
                          <CommandEmpty>No attendees found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value={"Walk-in"}
                              key={"no-rsvp"}
                              onSelect={() => {
                                form.setValue("rsvpId", "Walk-in");
                                form.setValue("name", "");
                                form.setValue("email", "");
                                form.setValue("phoneNumber", "");
                              }}
                            >
                              Walk-in
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  "Walk-in" == field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                            {rsvps
                              .filter((rsvp) => !rsvp.attended)
                              .map((rsvp) => (
                                <CommandItem
                                  value={`${rsvp.name} ${rsvp.phone} ${rsvp.email}`}
                                  key={rsvp.id}
                                  onSelect={() => {
                                    setSelectedRsvp(rsvp);
                                    form.setValue(
                                      "rsvpId",
                                      `${rsvp.name} ${rsvp.phone} ${rsvp.email}`
                                    );
                                    form.setValue("name", rsvp.name);
                                    form.setValue("email", rsvp.email);
                                    form.setValue("phoneNumber", rsvp.phone);
                                  }}
                                >
                                  {rsvp.name} - {rsvp.phone} | {rsvp.email}
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      `${rsvp.name} ${rsvp.phone} ${rsvp.email}` ===
                                        field.value
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="identifier"
                render={() => (
                  <FormItem>
                    <FormLabel>Identifier</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        type="text"
                        placeholder="shadcn"
                        value={`HO${attendeesCount < 10 && "0"}${
                          attendeesCount + 1
                        }`}
                      />
                    </FormControl>
                    <FormDescription>
                      Identifier for the attendee. Will serve as their ID for
                      the event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>The attendee&apos;s name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>
                      The attendee&apos;s phone number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>
                      The attendee&apos;s email address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Register Attendee</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
