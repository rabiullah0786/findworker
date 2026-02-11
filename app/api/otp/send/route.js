import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import crypto from "crypto";

export const runtime = "nodejs";

const OTP_TTL_MINUTES = 10;
const MAX_ACCOUNTS_PER_PHONE = 3;

function normalizePhone(input) {
  const digits = (input || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.startsWith("+") && digits.length >= 12) return input;
  return null;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRequestId() {
  return crypto.randomBytes(12).toString("hex");
}

export async function POST(req) {
  try {
    const { phone } = await req.json();
    const normalized = normalizePhone(phone);

    if (!normalized) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Check if phone already has too many accounts
    const workersSnapshot = await db
      .collection("workers")
      .where("whatsapp", "==", normalized)
      .get();

    if (workersSnapshot.size >= MAX_ACCOUNTS_PER_PHONE) {
      return NextResponse.json(
        { error: "This number already has 3 accounts" },
        { status: 403 }
      );
    }

    // Generate OTP and request ID
    const otp = generateOTP();
    const requestId = generateRequestId();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Store OTP in Firestore
    await db.collection("otp_requests").doc(requestId).set({
      phone: normalized,
      otp,
      verified: false,
      attempts: 0,
      createdAt: new Date(),
      expiresAt,
    });

    // Log OTP for development (remove in production)
    console.log(`✅ OTP for ${normalized}: ${otp} (Request ID: ${requestId})`);

    return NextResponse.json({
      ok: true,
      requestId,
      message: "OTP sent successfully",
      // For development only - remove in production
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (err) {
    console.error("OTP Send Error:", err);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
