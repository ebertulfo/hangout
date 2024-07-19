import { useAttendees } from "@/app/_hooks/Attendees";
import { useQueue } from "@/app/_hooks/Queue";
import { useVendor } from "@/app/_hooks/Vendors";
import { VendorQueue } from "./VendorQueue";

export function QueueManagement({ eventId }: { eventId: string }) {
  const { queue } = useQueue(eventId);
  const { vendors } = useVendor(eventId);
  const { attendees } = useAttendees(eventId);
  return (
    <div>
      <div className="flex gap-5">
        {
          // Create a list of vendor slots
          vendors.map((vendor) => (
            <VendorQueue
              eventId={eventId}
              key={vendor.id}
              vendor={vendor}
              attendees={attendees.filter(
                (attendee) =>
                  attendee.status === "in meeting" &&
                  attendee.currentMeetingVendorId === vendor.id
              )}
            />
          ))
        }
      </div>
    </div>
  );
}
