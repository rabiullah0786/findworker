import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;

export async function POST(req) {
  try {
    const { phone, otp, requestId } = await req.json();

    if (!phone || !otp || !requestId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get OTP record from MongoDB
    const record = await db
      .collection("otp_requests")
      .findOne({ requestId });

    if (!record) {
      return NextResponse.json(
        { error: "OTP not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (record.verified) {
      return NextResponse.json({
        ok: true,
        verified: true,
        message: "OTP already verified",
      });
    }

    // Check if OTP expired
    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 410 }
      );
    }

    // Check attempts limit
    if (record.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many attempts" },
        { status: 429 }
      );
    }

    // Verify OTP
    if (String(record.otp) !== String(otp)) {
      // Increment attempts
      await db.collection("otp_requests").updateOne(
        { requestId },
        { $set: { attempts: record.attempts + 1 } }
      );

      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 401 }
      );
    }

    // Mark as verified
    await db.collection("otp_requests").updateOne(
      { requestId },
      { $set: { verified: true, verifiedAt: new Date() } }
    );

    return NextResponse.json({
      ok: true,
      verified: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("OTP Verify Error:", err);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
