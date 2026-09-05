import { NextResponse } from "next/server";
import { updateBranchName } from "@/lib/areas-store";

export async function PATCH(request) {
  const body = await request.json();
  const { id, name } = body;

  if (!id || !name || !name.trim()) {
    return NextResponse.json(
      { error: "id and name are required" },
      { status: 400 }
    );
  }

  try {
    const updated = await updateBranchName(id, name);
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
