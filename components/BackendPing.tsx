"use client";

import { useEffect } from "react";
import { BACKEND_URL } from "@/lib/config";

export default function BackendPing() {
  useEffect(() => {
    fetch(`${BACKEND_URL}/health`, { method: "GET" }).catch(() => {});
  }, []);

  return null;
}
