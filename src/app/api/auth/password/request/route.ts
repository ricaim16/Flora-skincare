import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../../../src/db/db";
import {
  admins,
  customers,
  passwordResetOtps,
} from "../../../../../../src/db/schema";
import {
  generateOtp,
  hashOtp,
  normalizeEmail,
  type SessionRole,
} from "../../../../../../src/lib/auth";
import { sendPasswordResetEmail } from "../../../../../../src/lib/email";

type RequestPasswordResetBody = {
  email: string;
  role: SessionRole;
};

export async function POST(req: Request) {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "Database is not configured. Add NEON_DB_URL first." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as RequestPasswordResetBody;
    const email = normalizeEmail(body.email || "");
    const role = body.role;

    if (!email || (role !== "customer" && role !== "admin")) {
      return NextResponse.json(
        { error: "Email and account type are required." },
        { status: 400 }
      );
    }

    const lookup =
      role === "admin"
        ? await db
            .select({ id: admins.id })
            .from(admins)
            .where(eq(admins.email, email))
            .limit(1)
        : await db
            .select({ id: customers.id })
            .from(customers)
            .where(eq(customers.email, email))
            .limit(1);

    if (!lookup[0]) {
      return NextResponse.json(
        { error: "No account found for this email." },
        { status: 404 }
      );
    }

    await db
      .update(passwordResetOtps)
      .set({ consumedAt: new Date() })
      .where(
        and(
          eq(passwordResetOtps.email, email),
          eq(passwordResetOtps.accountType, role),
          isNull(passwordResetOtps.consumedAt)
        )
      );

    const code = generateOtp();

    await db.insert(passwordResetOtps).values({
      email,
      accountType: role,
      codeHash: await hashOtp(code),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const delivery = await sendPasswordResetEmail({
      email,
      code,
      accountType: role,
    });

    return NextResponse.json({
      message: "Verification code sent.",
      previewCode: delivery.previewCode,
    });
  } catch (error) {
    console.error("POST /api/auth/password/request error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code." },
      { status: 500 }
    );
  }
}
