import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import Hero from "@/models/hero.model";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
    try {
        await connectMongo();
        const images = await Hero.find().sort({ createdAt: -1 });
        return NextResponse.json({ data: images }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const token = req.headers.get("authorization");
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
        }

        await connectMongo();

        const formData = await req.formData();
        const imageFile = formData.get("image") as File | null;
        
        // Optional: Allow passing an active state, defaults to true
        const isActiveStr = formData.get("isActive") as string;
        const isActive = isActiveStr === "false" ? false : true;

        if (!imageFile) {
            return NextResponse.json({ message: "No image file provided" }, { status: 400 });
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "hero-section" }, // Dedicated folder for hero images
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const newHeroImage = await Hero.create({
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            isActive: isActive,
        });

        return NextResponse.json({ message: "Hero image uploaded successfully", data: newHeroImage }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}