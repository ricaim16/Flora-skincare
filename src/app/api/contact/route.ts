import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabase } from "../../../db/db";
import { contacts } from "../../../db/schema";
import nodemailer from "nodemailer";

// POST handler
export async function POST(req: NextRequest) {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json(
        {
          error:
            "Contact form submissions are unavailable until the database is configured with NEON_DB_URL.",
        },
        { status: 503 }
      );
    }

    // Parse JSON body
    const body = await req.json();
    const { name, email, phoneNumber, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Insert into DB
    const inserted = await db.insert(contacts).values({
      name,
      email,
      phoneNumber: phoneNumber || null,
      message,
    }).returning();

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password if 2FA enabled
      },
    });

    // Send email
    try {
      await transporter.sendMail({
  from: `"FloraSkin Contact Form" <contact@floraskin.com>`, // Your domain email
  to: process.env.EMAIL_USER, // Your inbox
  replyTo: email, // Optional: user’s email to reply directly
  subject: `New Contact Message from ${name}`,
  html: `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phoneNumber || "N/A"}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `,
});

      console.log("Email sent successfully");
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Continue, don't block DB insert
    }

    // Return success response
    return NextResponse.json(
      { success: true, contact: inserted[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error handling contact form:", error);
    return NextResponse.json(
      { error: "Something went wrong submitting the contact form." },
      { status: 500 }
    );
  }
}
