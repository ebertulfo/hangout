import dayjs from "dayjs";
export const renderTimeLeft = (meetingStartedAt: string, time: number) => {
  const timeLeft = dayjs(meetingStartedAt)
    .add(45, "minutes")
    .diff(dayjs(time), "ms", true);
  if (timeLeft <= 0) {
    return (
      <span className="text-red-500 font-bold">
        Time&apos;s up! Please end the meeting.
      </span>
    );
  }
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = ((timeLeft % 60000) / 1000).toFixed(0);
  let fontColor = "text-black";
  if (minutes <= 15) {
    fontColor = "text-orange-500";
  }
  if (minutes <= 5) {
    fontColor = "text-red-500 font-bold";
  }

  return (
    <span className={`${fontColor}`}>
      {minutes} minutes {seconds} seconds remaining
    </span>
  );
};
