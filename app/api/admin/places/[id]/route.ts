import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

function getToken(req: NextRequest) {
  return req.cookies.get("admin_token")?.value ?? "";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/admin/places/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken(req)}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${BACKEND_URL}/admin/places/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken(req)}` },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
