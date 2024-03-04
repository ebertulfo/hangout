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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase/firebase";
import { IAttendee } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { useContext } from "react";

const formSchema = z.object({
  identifier: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().email(),
});

export default function EditAttendeeDialog({
  attendee,
  eventId,
}: {
  attendee: IAttendee;
  eventId: string;
}) {
  const { toast } = useToast();
  const user = useContext(AuthContext);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: attendee.identifier,
      name: attendee.name,
      phoneNumber: attendee.phoneNumber,
      email: attendee.email,
    },
  });
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    let attendeeRef = doc(db, `/events/${eventId}/attendees/${attendee.id}`);
    await updateDoc(attendeeRef, {
      ...values,
    });
    console.log(values);
    toast({
      title: "Attendee Updated",
    });
  }
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change attendee details</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

              <Button type="submit">Update Attendee</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
