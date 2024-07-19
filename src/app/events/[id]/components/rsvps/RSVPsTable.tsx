import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebase/firebase";
import { IRsvp } from "@/types";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export function RSVPsTable({ eventId }: { eventId: string }) {
  const [rsvps, setRsvps] = useState<IRsvp[]>([]);
  useEffect(() => {
    // Fetch RSVPs
    const unsubRSVPs = onSnapshot(
      collection(db, "events", eventId as string, "rsvps"),
      (snapshot) => {
        const newRsvps: IRsvp[] = [];
        snapshot.forEach((doc) => {
          newRsvps.push({ ...doc.data(), id: doc.id } as IRsvp);
        });
        setRsvps(newRsvps);
      }
    );
    return () => {
      unsubRSVPs();
    };
  }, [eventId]);

  const handlePrintedChange = async (rsvp: IRsvp) => {
    // Update the RSVP's floorPlanPrinted field
    console.log("Updating RSVP", rsvp.id);
    const rsvpRef = doc(db, "events", eventId, "rsvps", rsvp.id);
    await updateDoc(rsvpRef, {
      floorPlanPrinted: !rsvp.floorPlanPrinted,
    });
  };

  return (
    <div>
      <Table className="max-w-[1024px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Floorplans Printed?</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rsvps.map((rsvp) => (
            <TableRow key={rsvp.id} className="h-[50px]">
              <TableCell className="w-[200px]">{rsvp.name}</TableCell>
              <TableCell>{rsvp.email}</TableCell>
              <TableCell>{rsvp.phone}</TableCell>
              <TableCell className="text-right">
                <Checkbox
                  checked={rsvp.floorPlanPrinted}
                  onCheckedChange={() => handlePrintedChange(rsvp)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
