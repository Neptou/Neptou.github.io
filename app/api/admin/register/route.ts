import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({ detail: "Request failed" }));
  if (!res.ok) {
    return NextResponse.json({ error: data.detail ?? "Registration failed" }, { status: res.status });
  }
  return NextResponse.json({ ok: true });
}
