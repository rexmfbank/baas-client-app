"use client"
import { useState, useEffect } from "react";

export function useTimer(initialSeconds: number, autoStart = true) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;
    
    const interval = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = (newSeconds?: number) => {
    setSeconds(newSeconds ?? initialSeconds);
    setIsRunning(true);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return {
    seconds,
    minutes,
    secs,
    isRunning,
    start,
    stop,
    reset,
    isExpired: seconds <= 0,
  };
}
