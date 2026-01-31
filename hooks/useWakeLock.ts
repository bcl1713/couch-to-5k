"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseWakeLockOptions {
  enabled: boolean;
}

export function useWakeLock({ enabled }: UseWakeLockOptions): void {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const isSupported = useCallback((): boolean => {
    return "wakeLock" in navigator;
  }, []);

  const requestWakeLock = useCallback(async (): Promise<void> => {
    if (!isSupported()) {
      return;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch (error) {
      console.error("Wake lock request failed:", error);
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async (): Promise<void> => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (error) {
        console.error("Wake lock release failed:", error);
      }
    }
  }, []);

  const handleVisibilityChange = useCallback((): void => {
    if (document.visibilityState === "visible" && enabled) {
      requestWakeLock();
    }
  }, [enabled, requestWakeLock]);

  useEffect(() => {
    if (enabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [enabled, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLock();
    };
  }, [handleVisibilityChange, releaseWakeLock]);
}
