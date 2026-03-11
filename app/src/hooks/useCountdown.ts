import { useState, useEffect } from "react";

export const useCountdown = (targetDate: string | null | undefined) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return null;

  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target + 24 * 60 * 60 * 1000 - now;

  if (diff <= 0) return null;

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours: h, minutes: m, seconds: s };
};
