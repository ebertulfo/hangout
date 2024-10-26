import { useEffect, useState } from "react";

export function useTimerTick() {
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    console.log("START TIMER INTERVAL");
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      console.log("CLEAR TIMER INTERVAL");
      clearInterval(interval);
    };
  }, []);

  return { time };
}
