import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

const MAX_ACCOUNTS_PER_PHONE = 3;

export async function POST(req) {
  try {
    const { worker, requestId } = await req.json();
    if (!worker || !requestId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const {
      name,
      age,
      skill,
      state,
      district,
      city,
      whatsapp,
      photo,
    } = worker;

    if (!name || !skill || !state || !district || !city || !whatsapp) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await getDb();

    const otpRecord = await db
      .collection("otp_requests")
      .findOne({ phone: whatsapp, requestId, verified: true });
    if (!otpRecord) {
      return NextResponse.json({ error: "Phone not verified" }, { status: 401 });
    }

    const count = await db
      .collection("workers")
      .countDocuments({ whatsapp });
    if (count >= MAX_ACCOUNTS_PER_PHONE) {
      return NextResponse.json(
        { error: "This number already has 3 accounts" },
        { status: 403 }
      );
    }

    const created = {
      name,
      age,
      skill,
      state,
      district,
      city,
      whatsapp,
      photo: photo || null,
      createdAt: new Date(),
    };

    await db.collection("workers").insertOne(created);

    return NextResponse.json({ ok: true, worker: created });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
