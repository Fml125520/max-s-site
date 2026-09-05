import { NextResponse } from "next/server";
import { getData, updateArea } from "@/lib/areas-store";

export async function GET() {
  const data = await getData();
  return NextResponse.json(data);
}

export async function PATCH(request) {
  const body = await request.json();
  const { id, name, price } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const updated = await updateArea(id, {
      name,
      price: price !== undefined ? Number(price) : undefined,
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
