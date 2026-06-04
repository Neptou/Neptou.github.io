import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

function getToken(req: NextRequest) {
  return req.cookies.get("admin_token")?.value ?? "";
}

export async function GET(req: NextRequest) {
  const res = await fetch(`${BACKEND_URL}/admin/places`, {
    headers: { Authorization: `Bearer ${getToken(req)}` },
  });
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/admin/places`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken(req)}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
