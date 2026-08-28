import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../db/db";
import { admins } from "../../../../db/schema";
import {
  applySessionCookie,
  comparePassword,
  normalizeEmail,
} from "../../../../lib/auth";

type AdminLoginBody = {
  email: string;
  password: string;
};

export async function POST(req: Request) {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "Database is not configured. Add NEON_DB_URL first." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as AdminLoginBody;
    const email = normalizeEmail(body.email || "");
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.passwordHash);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "Admin logged in successfully.",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin" as const,
      },
    });

    applySessionCookie(response, {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "admin",
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json(
      { error: "Failed to log in." },
      { status: 500 }
    );
  }
}
