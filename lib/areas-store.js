import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "areas.json");

/**
 * ⚠️ Vercel note:
 * In production on Vercel, serverless functions run on a read-only
 * filesystem, so writes made here will NOT persist between requests
 * once deployed (this works perfectly in local dev — `npm run dev`).
 *
 * To make edits persist on the live site, add a database from the
 * Vercel Marketplace (Project → Storage tab) — Neon or Supabase
 * (both Postgres, free to start) are the simplest. Once you have one,
 * you only need to rewrite the three functions below to read/write
 * that database instead of this JSON file — nothing in the API route
 * or the dashboard component needs to change.
 */

export async function getData() {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

async function saveData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function updateArea(areaId, updates) {
  const data = await getData();
  for (const branch of data.branches) {
    const area = branch.areas.find((a) => a.id === areaId);
    if (area) {
      if (updates.name !== undefined && updates.name.trim() !== "") {
        area.name = updates.name.trim();
      }
      if (updates.price !== undefined && !Number.isNaN(updates.price)) {
        area.price = updates.price;
      }
      await saveData(data);
      return area;
    }
  }
  throw new Error("area-not-found");
}

export async function updateBranchName(branchId, name) {
  const data = await getData();
  const branch = data.branches.find((b) => b.id === branchId);
  if (!branch) throw new Error("branch-not-found");
  if (name && name.trim() !== "") {
    branch.name = name.trim();
    await saveData(data);
  }
  return branch;
}
