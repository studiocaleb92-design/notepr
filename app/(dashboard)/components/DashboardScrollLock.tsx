"use client";

import { useEffect } from "react";

/**
 * Locks document scroll while the dashboard is mounted so only in-app regions
 * (e.g. the note editor column) scroll. Restores previous overflow on leave.
 */
export default function DashboardScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);
  return null;
}
