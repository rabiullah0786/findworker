
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await getDb();

        const { worker } = await req.json();

        // 🔍 Check duplicate by WhatsApp
        const existing = await db.collection("workers").findOne({
            whatsapp: worker.whatsapp,
        });

        if (existing) {
            return NextResponse.json(
                { error: "Account already exists with this number" },
                { status: 400 }
            );
        }

        const result = await db.collection("workers").insertOne(worker);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create worker" },
            { status: 500 }
        );
    }
}