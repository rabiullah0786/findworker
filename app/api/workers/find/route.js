// import { NextResponse } from "next/server";
// import { getDb } from "@/lib/mongodb";

// export async function POST(req) {
//     try {
//         const db = await getDb();

//         const { skill, state, district, city } = await req.json();

//         const workers = await db.collection("workers")
//             .find({
//                 skill: { $regex: skill, $options: "i" },
//                 state: { $regex: state, $options: "i" },
//                 district: { $regex: district, $options: "i" },
//                 city: { $regex: city, $options: "i" },
//             })
//             .toArray();

//         return NextResponse.json(workers);
//     } catch (error) {
//         return NextResponse.json(
//             { error: "Failed to fetch workers" },
//             { status: 500 }
//         );
//     }
// }


// import { NextResponse } from "next/server";
// import { getDb } from "@/lib/mongodb";
// import cloudinary from "@/lib/cloudinary";
// i

// export async function POST(req) {
//     try {
//         const { skill, state, district, city } = await req.json();
//         const uploadResponse = await cloudinary.uploader.upload(photo, {
//             folder: "workers",
//         });
//         const imageUrl = uploadResponse.secure_url;
//         const db = await getDb();

//         const workers = await db.collection("workers")
//             .find({
//                 skill: skill,
//                 state: state,
//                 district: district,
//                 city: city,
//                 photo: imageUrl


//             })
//             .limit(20) // performance boost
//             .toArray();

//         return NextResponse.json(workers);

//     } catch (error) {
//         return NextResponse.json(
//             { error: "Failed to fetch workers" },
//             { status: 500 }
//         );
//     }
// }



import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req) {
    try {
        console.log("Find API Hit");

        const body = await req.json();
        console.log("Body:", body);

        const db = await getDb();
        const workers = await db.collection("workers")
            .find({
                skill: body.skill,
                state: body.state,
                district: body.district,
                city: body.city,
            })
            .limit(20)
            .toArray();


        return NextResponse.json(workers);

    } catch (error) {
        console.error("Find Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch workers" },
            { status: 500 }
        );
    }
}