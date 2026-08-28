import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../../../src/db/db";
import { expenses } from "../../../../../../src/db/schema";
import { getCurrentSession } from "../../../../../../src/lib/auth";
import { isMissingTableError } from "../../../../../../src/lib/db-errors";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
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

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    try {
      const deleted = await db
        .delete(expenses)
        .where(eq(expenses.id, id))
        .returning({ id: expenses.id });

      if (!deleted.length) {
        return NextResponse.json({ error: "Expense not found." }, { status: 404 });
      }

      return NextResponse.json({ message: "Entry deleted successfully." });
    } catch (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json(
          { error: "Expense table is not available until the latest migration is applied." },
          { status: 409 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("DELETE /api/admin/expenses/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry." },
      { status: 500 }
    );
  }
}
