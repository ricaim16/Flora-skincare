import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../../src/db/db";
import { customers } from "../../../../../src/db/schema";
import {
  applySessionCookie,
  comparePassword,
  normalizeEmail,
} from "../../../../../src/lib/auth";
import { eq } from "drizzle-orm";

type LoginBody = {
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

    const body = (await req.json()) as LoginBody;
    const email = normalizeEmail(body.email || "");
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, customer.passwordHash);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "Logged in successfully.",
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: "customer" as const,
      },
    });

    applySessionCookie(response, {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: "customer",
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "Failed to log in." }, { status: 500 });
  }
}
