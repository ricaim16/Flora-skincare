import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../db/db";
import { admins } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "Database is not configured. Add NEON_DB_URL first." },
        { status: 503 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch admin profile
    const [admin] = await db
      .select({
        id: admins.id,
        email: admins.email,
      })
      .from(admins)
      .where(eq(admins.id, payload.id));

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error: any) {
    console.error("GET /api/admin/profile error:", error.message);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
