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
import { IEvent, IVendor } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthContext } from "@/app/_contexts/AuthContext";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase/firebase";
import { cn } from "@/lib/utils";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { PopoverContent } from "@radix-ui/react-popover";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
const formSchema = z.object({
  vendor: z.string(),
  slots: z.number(),
});
export default function AddVendorDialog({ event }: { event: IEvent }) {
  const { toast } = useToast();
  const user = useContext(AuthContext);
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [addedVendors, setAddedVendors] = useState(event?.vendors || []);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendor: "",
      slots: 5,
    },
  });

  // Load vendors
  useEffect(() => {
    if (event && user?.uid) {
      const vendorsRef = collection(db, "vendors");
      const q = query(vendorsRef, where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let vendors: IVendor[] = [];
        querySnapshot.forEach((doc) => {
          vendors.push({ vendorId: doc.id, ...doc.data() } as IVendor);
        });
        setVendors(vendors);
      });
      return () => unsubscribe();
    }
  }, [event, user.uid]);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Get the vendor id from the string
    const vendorId = values.vendor.split("-")[1];
    // Get the vendor from the vendors array
    const vendor = vendors.find((vendor) => vendor.vendorId === vendorId);
    // Add the vendor to the event
    console.log("@@@ TEST", `/events/${event.id}/vendors`);
    console.log(values);
    let eventVendorRef = collection(db, `/events/${event.id}/vendors`);
    await addDoc(eventVendorRef, {
      ...vendor,
      vendorId: vendor?.vendorId,
      slots: values.slots,
      meetings: [],
    });
    console.log(values);
    toast({
      title: "Add Vendor",
    });
    form.reset();
  }
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Add Vendor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vendor to Event</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Vendor</FormLabel>
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
                              ? vendors.find(
                                  (vendor) =>
                                    `${vendor.name}-${vendor.vendorId}` ===
                                    field.value
                                )?.name
                              : "Select Vendor"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search framework..."
                            className="h-9"
                          />
                          <CommandEmpty>No framework found.</CommandEmpty>
                          <CommandGroup>
                            {vendors.map((vendor) => (
                              <CommandItem
                                value={`${vendor.name}-${vendor.vendorId}`}
                                key={`${vendor.name}-${vendor.vendorId}`}
                                onSelect={() => {
                                  console.log(vendor);
                                  form.setValue(
                                    "vendor",
                                    `${vendor.name}-${vendor.vendorId}`
                                  );
                                }}
                              >
                                {`${vendor.name}-${vendor.vendorId}`}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    `${vendor.name}-${vendor.vendorId}` ===
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
                    <FormDescription>
                      This is the language that will be used in the dashboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slots</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="shadcn" {...field} />
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
