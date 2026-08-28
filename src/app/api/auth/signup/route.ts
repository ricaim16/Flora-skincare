import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../../src/db/db";
import { customers } from "../../../../../src/db/schema";
import {
  assertStrongEnoughPassword,
  hashPassword,
  normalizeEmail,
} from "../../../../../src/lib/auth";
import { eq } from "drizzle-orm";

type SignupBody = {
  name: string;
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

    const body = (await req.json()) as SignupBody;
    const name = body.name?.trim();
    const email = normalizeEmail(body.email || "");
    const password = body.password || "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (!assertStrongEnoughPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const [existingCustomer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (existingCustomer) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    await db.insert(customers).values({
      name,
      email,
      passwordHash: await hashPassword(password),
    });

    return NextResponse.json(
      { message: "Account created successfully. Please log in." },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 }
    );
  }
}
