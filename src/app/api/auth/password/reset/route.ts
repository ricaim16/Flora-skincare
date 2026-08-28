import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../../../src/db/db";
import {
  admins,
  customers,
  passwordResetOtps,
} from "../../../../../../src/db/schema";
import {
  assertStrongEnoughPassword,
  compareOtp,
  hashPassword,
  normalizeEmail,
  type SessionRole,
} from "../../../../../../src/lib/auth";

type ResetPasswordBody = {
  email: string;
  code: string;
  newPassword: string;
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

    const body = (await req.json()) as ResetPasswordBody;
    const email = normalizeEmail(body.email || "");
    const code = body.code?.trim() || "";
    const newPassword = body.newPassword || "";
    const role = body.role;

    if (!email || !code || !newPassword || (role !== "customer" && role !== "admin")) {
      return NextResponse.json(
        { error: "Email, code, password, and account type are required." },
        { status: 400 }
      );
    }

    if (!assertStrongEnoughPassword(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const [otpRecord] = await db
      .select()
      .from(passwordResetOtps)
      .where(
        and(
          eq(passwordResetOtps.email, email),
          eq(passwordResetOtps.accountType, role)
        )
      )
      .orderBy(desc(passwordResetOtps.id))
      .limit(1);

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Verification code not found." },
        { status: 404 }
      );
    }

    if (otpRecord.consumedAt) {
      return NextResponse.json(
        { error: "This code has already been used." },
        { status: 400 }
      );
    }

    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "This code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const isCodeValid = await compareOtp(code, otpRecord.codeHash);

    if (!isCodeValid) {
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);

    if (role === "admin") {
      await db
        .update(admins)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(admins.email, email));
    } else {
      await db
        .update(customers)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(customers.email, email));
    }

    await db
      .update(passwordResetOtps)
      .set({ consumedAt: new Date() })
      .where(eq(passwordResetOtps.id, otpRecord.id));

    return NextResponse.json({
      message: "Password updated successfully. Please log in.",
    });
  } catch (error) {
    console.error("POST /api/auth/password/reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 500 }
    );
  }
}
