import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await getDb();

        const { skill, state, district, city } = await req.json();

        const workers = await db.collection("workers")
            .find({
                skill: { $regex: skill, $options: "i" },
                state: { $regex: state, $options: "i" },
                district: { $regex: district, $options: "i" },
                city: { $regex: city, $options: "i" },
            })
            .toArray();

        return NextResponse.json(workers);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch workers" },
            { status: 500 }
        );
    }
}