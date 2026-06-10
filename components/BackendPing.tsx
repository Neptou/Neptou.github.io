"use client";

import { useEffect } from "react";
import { BACKEND_URL } from "@/lib/config";

export default function BackendPing() {
  useEffect(() => {
    // Fire-and-forget Render warmup; abort if the cold instance hangs.
    fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(8000),
    }).catch(() => {});
  }, []);

  return null;
}
