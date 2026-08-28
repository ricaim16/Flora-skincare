import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../db/db";
import { admins } from "../../../../db/schema";
import {
  assertStrongEnoughPassword,
  comparePassword,
  getCurrentSession,
  hashPassword,
} from "../../../../lib/auth";

type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export async function POST(req: Request) {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "Database is not configured. Add NEON_DB_URL first." },
        { status: 503 }
      );
    }

    const session = await getCurrentSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as ChangePasswordBody;
    const currentPassword = body.currentPassword || "";
    const newPassword = body.newPassword || "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (!assertStrongEnoughPassword(newPassword)) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, session.id))
      .limit(1);

    if (!admin) {
      return NextResponse.json({ error: "Admin not found." }, { status: 404 });
    }

    const matches = await comparePassword(currentPassword, admin.passwordHash);

    if (!matches) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    await db
      .update(admins)
      .set({
        passwordHash: await hashPassword(newPassword),
        updatedAt: new Date(),
      })
      .where(eq(admins.id, admin.id));

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("POST /api/admin/change-password error:", error);
    return NextResponse.json(
      { error: "Failed to update password." },
      { status: 500 }
    );
  }
}
