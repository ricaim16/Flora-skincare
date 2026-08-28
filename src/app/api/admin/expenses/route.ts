import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../../src/db/db";
import { expenses } from "../../../../../src/db/schema";
import { getCurrentSession } from "../../../../../src/lib/auth";
import { isMissingTableError } from "../../../../../src/lib/db-errors";

type ExpenseBody = {
  title: string;
  note?: string;
  entryType: "expense" | "tip";
  amountInCents: number;
  entryDate: string;
};

export async function GET() {
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

    try {
      const rows = await db.select().from(expenses).orderBy(desc(expenses.entryDate), desc(expenses.createdAt));
      return NextResponse.json({ expenses: rows });
    } catch (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ expenses: [], schemaMode: "legacy" });
      }

      throw error;
    }
  } catch (error) {
    console.error("GET /api/admin/expenses error:", error);
    return NextResponse.json(
      { error: "Failed to load expenses." },
      { status: 500 }
    );
  }
}

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

    const body = (await req.json()) as ExpenseBody;

    if (
      !body.title ||
      !body.entryDate ||
      !body.amountInCents ||
      (body.entryType !== "expense" && body.entryType !== "tip")
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    try {
      const [entry] = await db
        .insert(expenses)
        .values({
          title: body.title.trim(),
          note: body.note?.trim() || "",
          entryType: body.entryType,
          amountInCents: body.amountInCents,
          entryDate: body.entryDate,
        })
        .returning();

      return NextResponse.json(
        { message: "Expense saved successfully.", expense: entry },
        { status: 201 }
      );
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
    console.error("POST /api/admin/expenses error:", error);
    return NextResponse.json(
      { error: "Failed to save expense." },
      { status: 500 }
    );
  }
}
