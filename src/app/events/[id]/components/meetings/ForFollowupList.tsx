import { useMeetings } from "@/app/_hooks/meetings";
import { useTimerTick } from "@/app/_hooks/timerTick";
import { renderTimeLeft } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

export function ForFollowupList({ eventId }: { eventId: string }) {
  const { time } = useTimerTick();
  const { meetings, toggleBuzzNotification, endMeeting } = useMeetings(eventId);

  // Filter only active meetings needing follow-up buzzes
  const meetingsNeedingFollowUp = useMemo(() => {
    return meetings.filter((meeting) => !meeting.meetingEndedAt); // Exclude ended meetings
  }, [meetings]);

  return (
    <div className="flex-row">
      <h3 className="text-xl font-bold mb-5">For Follow Up</h3>
      <Card className="w-[400px] space-y-3">
        <CardContent className="flex flex-col gap-3">
          {meetingsNeedingFollowUp.length ? (
            meetingsNeedingFollowUp.map((meeting) => {
              const timeLeft = renderTimeLeft(meeting.meetingStartedAt, time);

              return (
                <Card key={meeting.attendeeId} className="p-4 shadow-sm">
                  <CardHeader>
                    <CardTitle>
                      {meeting.attendeeIdentifier} - {meeting.attendeeName}
                      {meeting.buzzerNumber && (
                        <span className="ml-2 text-blue-500">
                          (Buzzer #{meeting.buzzerNumber})
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="pb-6">Time Remaining: {timeLeft}</p>
                    <p className="text-sm text-gray-700">
                      Select buzz to send or undo:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          toggleBuzzNotification(meeting.id, "10-minute")
                        }
                        className={
                          meeting.tenMinuteBuzzed
                            ? "bg-green-200 text-green-700"
                            : ""
                        }
                      >
                        {meeting.tenMinuteBuzzed
                          ? "Undo 10-Minute Buzz"
                          : "Send 10-Minute Buzz"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          toggleBuzzNotification(meeting.id, "5-minute")
                        }
                        className={
                          meeting.fiveMinuteBuzzed
                            ? "bg-green-200 text-green-700"
                            : ""
                        }
                      >
                        {meeting.fiveMinuteBuzzed
                          ? "Undo 5-Minute Buzz"
                          : "Send 5-Minute Buzz"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          toggleBuzzNotification(meeting.id, "time-up")
                        }
                        className={
                          meeting.timeUpBuzzed
                            ? "bg-green-200 text-green-700"
                            : ""
                        }
                      >
                        {meeting.timeUpBuzzed
                          ? "Undo Time’s Up Buzz"
                          : "Send Time’s Up Buzz"}
                      </Button>
                    </div>
                    <div className="pt-4">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => endMeeting(meeting.id)}
                      >
                        End Meeting
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-center text-gray-500">
              Nothing to follow up. Yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
