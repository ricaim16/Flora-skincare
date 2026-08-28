import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../db/db";
import { admins } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { getCurrentSession, getSessionFromAuthHeader } from "../../../../lib/auth";

export async function GET(req: Request) {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "Database is not configured. Add NEON_DB_URL first." },
        { status: 503 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const session = (await getCurrentSession()) ?? getSessionFromAuthHeader(authHeader);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch admin profile
    const [admin] = await db
      .select({
        id: admins.id,
        name: admins.name,
        email: admins.email,
      })
      .from(admins)
      .where(eq(admins.id, session.id));

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error("GET /api/admin/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
