import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

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

    // Get OTP record from Firestore
    const otpDoc = await db
      .collection("otp_requests")
      .doc(requestId)
      .get();

    if (!otpDoc.exists) {
      return NextResponse.json(
        { error: "OTP not found" },
        { status: 404 }
      );
    }

    const record = otpDoc.data();

    // Check if already verified
    if (record.verified) {
      return NextResponse.json({
        ok: true,
        verified: true,
        message: "OTP already verified",
      });
    }

    // Check if OTP expired
    if (record.expiresAt.toDate() < new Date()) {
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
      await db.collection("otp_requests").doc(requestId).update({
        attempts: record.attempts + 1,
      });

      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 401 }
      );
    }

    // Mark as verified
    await db.collection("otp_requests").doc(requestId).update({
      verified: true,
      verifiedAt: new Date(),
    });

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
