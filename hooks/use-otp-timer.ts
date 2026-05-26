"use client";

import { useEffect, useMemo, useState } from "react";

export function useOtpTimer(expiresAt: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const seconds = useMemo(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.ceil((expiresAt - now) / 1000));
  }, [expiresAt, now]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return {
    seconds,
    minutes,
    secs,
    isExpired: seconds <= 0,
  };
}
