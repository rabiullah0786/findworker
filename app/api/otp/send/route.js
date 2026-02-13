import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import crypto from "crypto";

export const runtime = "nodejs";

const OTP_TTL_MINUTES = 10;
const MAX_ACCOUNTS_PER_PHONE = 3;
const MSG91_AUTHKEY = process.env.MSG91_AUTHKEY;

function normalizePhone(input) {
  const digits = (input || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.startsWith("+")) return digits.substring(1);
  return null;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRequestId() {
  return crypto.randomBytes(12).toString("hex");
}

// Send SMS via MSG91
async function sendSMSViaMsg91(phone, otp) {
  try {
    const response = await fetch(
      `https://api.msg91.com/api/sendotp.php?authkey=${MSG91_AUTHKEY}&mobile=${phone}&otp=${otp}`,
      {
        method: "GET",
      }
    );

    const text = await response.text();
    console.log("MSG91 Response:", text, "Status:", response.status);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${text}` };
    }

    // MSG91 returns a simple response, not JSON
    if (text.includes("success")) {
      return { success: true, msgId: phone };
    } else if (text.includes("Invalid authkey")) {
      return { success: false, error: "Invalid authkey - check MSG91_AUTHKEY" };
    } else {
      return { success: false, error: text };
    }
  } catch (err) {
    console.error("MSG91 Send Error:", err);
    return { success: false, error: err.message };
  }
}

export async function POST(req) {
  try {
    if (!MSG91_AUTHKEY) {
      return NextResponse.json(
        { error: "MSG91_AUTHKEY not configured" },
        { status: 500 }
      );
    }

    const { phone } = await req.json();
    const normalized = normalizePhone(phone);

    if (!normalized) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if phone already has too many accounts
    const workersCount = await db
      .collection("workers")
      .countDocuments({ whatsapp: `+${normalized}` });

    if (workersCount >= MAX_ACCOUNTS_PER_PHONE) {
      return NextResponse.json(
        { error: "This number already has 3 accounts" },
        { status: 403 }
      );
    }

    // Generate OTP and request ID
    const otp = generateOTP();
    const requestId = generateRequestId();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Send OTP via MSG91
    const smsResult = await sendSMSViaMsg91(normalized, otp);

    if (!smsResult.success) {
      console.error("Failed to send SMS:", smsResult.error);
      return NextResponse.json(
        { error: "Failed to send OTP, please try again" },
        { status: 500 }
      );
    }

    // Store OTP in MongoDB
    await db.collection("otp_requests").insertOne({
      requestId,
      phone: `+${normalized}`,
      otp,
      verified: false,
      attempts: 0,
      msgId: smsResult.msgId,
      createdAt: new Date(),
      expiresAt,
    });

    console.log(`✅ OTP sent successfully to ${normalized} (Request ID: ${requestId})`);

    return NextResponse.json({
      ok: true,
      requestId,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("OTP Send Error:", err);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
