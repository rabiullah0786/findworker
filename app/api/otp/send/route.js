import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import crypto from "crypto";
import twilio from "twilio";

export const runtime = "nodejs";

const OTP_TTL_MINUTES = 5;
const MAX_ACCOUNTS_PER_PHONE = 3;

function normalizePhone(input) {
  const digits = (input || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.startsWith("+") && digits.length >= 12) return input;
  return null;
}

function hashOtp(otp, requestId) {
  return crypto.createHash("sha256").update(`${otp}:${requestId}`).digest("hex");
}

export async function POST(req) {
  try {
    const { phone } = await req.json();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
      return NextResponse.json(
        { error: "SMS service is not configured" },
        { status: 500 }
      );
    }

    const db = await getDb();
    const workersCount = await db
      .collection("workers")
      .countDocuments({ whatsapp: normalized });
    if (workersCount >= MAX_ACCOUNTS_PER_PHONE) {
      return NextResponse.json(
        { error: "This number already has 3 accounts" },
        { status: 403 }
      );
    }

    const requestId = crypto.randomBytes(12).toString("hex");
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = hashOtp(otp, requestId);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await db.collection("otp_requests").insertOne({
      phone: normalized,
      otpHash,
      requestId,
      expiresAt,
      verified: false,
      attempts: 0,
      createdAt: new Date(),
    });

    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    await client.messages.create({
      from: TWILIO_FROM_NUMBER,
      to: normalized,
      body: `Your FindWorker OTP is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`,
    });

    return NextResponse.json({ requestId });
  } catch (err) {
    console.error("OTP send failed:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
