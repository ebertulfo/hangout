import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useVendor } from "@/app/_hooks/vendors";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { IAttendee } from "@/types";
import { useContext } from "react";

const formSchema = z.object({
  identifier: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().email(),
  preferredVendors: z.array(z.string()).optional(),
});

export default function AttendeeDetailsDialog({
  attendee,
  eventId,
  isOpen,
  handleClose,
}: {
  attendee: IAttendee;
  eventId: string;
  isOpen: boolean;
  handleClose: () => void;
}) {
  const { updateAttendee } = useAttendees(eventId);
  const { vendors } = useVendor(eventId); // Fetch vendors for selection
  const user = useContext(AuthContext);

  // Form setup with default preferred vendors
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: attendee.identifier,
      name: attendee.name,
      phoneNumber: attendee.phoneNumber,
      email: attendee.email,
      preferredVendors: attendee.preferredVendors || [],
    },
  });

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateAttendee(attendee.id, values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attendee Details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Editable Preferred Vendors */}
            <FormField
              control={form.control}
              name="preferredVendors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Vendors</FormLabel>
                  <FormDescription>
                    Select vendors the attendee is interested in meeting.
                  </FormDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vendors.map((vendor) => (
                      <div key={vendor.id} className="flex items-center">
                        <Checkbox
                          checked={field.value?.includes(vendor.id)}
                          onCheckedChange={(checked) => {
                            const newPreferred = checked
                              ? [...(field.value || []), vendor.id]
                              : field.value?.filter((id) => id !== vendor.id);
                            field.onChange(newPreferred);
                          }}
                        />
                        <span className="ml-2">{vendor.name}</span>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Editable Fields */}
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identifier</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identifier for the attendee. Will serve as their ID for the
                    event.
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

            <Button type="submit">Update Attendee Details</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
