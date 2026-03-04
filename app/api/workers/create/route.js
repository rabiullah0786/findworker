
// import { NextResponse } from "next/server";
// import { getDb } from "@/lib/mongodb";

// export async function POST(req) {
//     try {
//         const db = await getDb();

//         const { worker } = await req.json();

//         // 🔍 Check duplicate by WhatsApp
//         const existing = await db.collection("workers").findOne({
//             whatsapp: worker.whatsapp,
//         });

//         if (existing) {
//             return NextResponse.json(
//                 { error: "Account already exists with this number" },
//                 { status: 400 }
//             );
//         }

//         const result = await db.collection("workers").insertOne(worker);

//         return NextResponse.json(result);
//     } catch (error) {
//         return NextResponse.json(
//             { error: "Failed to create worker" },
//             { status: 500 }
//         );
//     }
// }




import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary"; // 👈 yaha import karo

export async function POST(req) {
    try {
        const { name, age, skill, state, district, city, whatsapp, photo } =
            await req.json();

        const db = await getDb();

        // 🔥 Base64 → Cloudinary Upload
        const uploadResponse = await cloudinary.uploader.upload(photo, {
            folder: "workers",
        });

        const imageUrl = uploadResponse.secure_url;

        // ✅ DB me sirf URL store hoga
        await db.collection("workers").insertOne({
            name,
            age,
            skill,
            state,
            district,
            city,
            whatsapp,
            photo: imageUrl, // 👈 base64 nahi
            createdAt: new Date(),
        });

        return NextResponse.json({ message: "Worker added successfully" });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to add worker" },
            { status: 500 }
        );
    }
}