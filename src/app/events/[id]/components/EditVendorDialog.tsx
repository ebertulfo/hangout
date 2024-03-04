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
import { IVendorInEvent } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthContext } from "@/app/_contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useContext } from "react";
const formSchema = z.object({
  slots: z.coerce.number(),
});
export default function EditVendorDialog({
  vendor,
  eventId,
}: {
  vendor: IVendorInEvent;
  eventId: string;
}) {
  const { toast } = useToast();
  const user = useContext(AuthContext);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slots: vendor.slots || 0,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    let eventVendorRef = doc(db, "events", eventId, "vendors", vendor.id);

    await updateDoc(eventVendorRef, { slots: values.slots });
    console.log(values);
    toast({
      title: "Event Vendor Updated",
    });
  }
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vendor to Event</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="slots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slots</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Number of slots"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of available slots for meetings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Add Vendor</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
