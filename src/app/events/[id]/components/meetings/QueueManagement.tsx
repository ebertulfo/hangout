import { useAttendees } from "@/app/_hooks/attendees";
import { useVendor } from "@/app/_hooks/vendors";
import { VendorQueue } from "./VendorQueue";

export function QueueManagement({ eventId }: { eventId: string }) {
  const { vendors } = useVendor(eventId);
  const { attendees } = useAttendees(eventId);
  return (
    <div className="flex">
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
