import { db } from "@/lib/firebase/firebase";
import { IVendorInEvent } from "@/types";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useVendor(eventId: string) {
  const [vendors, setVendors] = useState<IVendorInEvent[]>([]);
  useEffect(() => {
    // Create realtime connection for the event's vendors
    const unsubVendors = onSnapshot(
      collection(db, "events", eventId as string, "vendors"),
      (snapshot) => {
        const newVendors: IVendorInEvent[] = [];
        snapshot.forEach((doc) => {
          newVendors.push({ ...doc.data(), id: doc.id } as IVendorInEvent);
        });
        setVendors(newVendors);
      }
    );

    return () => {
      unsubVendors();
    };
  }, [eventId]);

  return {
    vendors,
  };
}
