import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../src/lib/auth";

export async function GET() {
  const session = await getCurrentSession();

  return NextResponse.json({ session });
}
