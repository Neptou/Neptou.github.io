import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    return NextResponse.json({ error: err.detail ?? "Login failed" }, { status: res.status });
  }

  const { token } = await res.json();
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}
