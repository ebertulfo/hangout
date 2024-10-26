import { useMeetings } from "@/app/_hooks/meetings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

export function ForFollowupList({ eventId }: { eventId: string }) {
  const { meetings } = useMeetings(eventId);
  const meetingsForFollowUp = useMemo(() => {
    return meetings.filter((meeting) => meeting.meetingEndedAt == null);
  }, [meetings]);
  return (
    <div className="flex-row">
      <h3 className="text-xl font-bold mb-5">For Follow Up</h3>
      <Card className="w-[360px]">
        <CardContent className="flex flex-col gap-3">
          {meetingsForFollowUp.length ? (
            meetingsForFollowUp.map((meeting) => (
              <Card key={meeting.attendeeId}>
                <CardHeader>
                  <CardTitle>
                    {meeting.attendeeIdentifier} - {meeting.attendeeName}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))
          ) : (
            <p>Nothing to follow up. Yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
