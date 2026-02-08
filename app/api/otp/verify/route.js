import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;

function hashOtp(otp, requestId) {
  return crypto.createHash("sha256").update(`${otp}:${requestId}`).digest("hex");
}

export async function POST(req) {
  try {
    const { phone, otp, requestId } = await req.json();
    if (!phone || !otp || !requestId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const db = await getDb();
    const record = await db.collection("otp_requests").findOne({ phone, requestId });
    if (!record) {
      return NextResponse.json({ error: "OTP not found" }, { status: 404 });
    }

    if (record.verified) {
      return NextResponse.json({ ok: true, verified: true });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 410 });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const otpHash = hashOtp(String(otp), requestId);
    if (otpHash !== record.otpHash) {
      await db.collection("otp_requests").updateOne(
        { _id: record._id },
        { $inc: { attempts: 1 } }
      );
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    await db.collection("otp_requests").updateOne(
      { _id: record._id },
      { $set: { verified: true, verifiedAt: new Date() } }
    );

    return NextResponse.json({ ok: true, verified: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
