import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { Gallery } from "@/models/gallery.model";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";
import sharp from "sharp";

// Increase timeout for large image processing (Vercel/Next.js)
export const maxDuration = 60; 

export async function GET() {
    try {
        await connectMongo();
        const images = await Gallery.find().sort({ createdAt: -1 });
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
        const title = formData.get("title") as string;
        const category = formData.get("category") as string;
        const size = formData.get("size") as string || "small";
        const description = formData.get("description") as string;
        const imageFile = formData.get("image") as File | null;

        if (!imageFile) {
            return NextResponse.json({ message: "No image file provided" }, { status: 400 });
        }

        // 1. Process the file buffer with Type Casting fix
        // We cast 'as any' to avoid the SharedArrayBuffer/resizable error and type mismatch
        const arrayBuffer = await imageFile.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer as any);

        // 2. Conditional Compression using Sharp
        // Cloudinary free limit is 10MB. If file is > 8MB, we compress.
        if (imageFile.size > 8 * 1024 * 1024) {
            console.log(`Original size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB. Compressing...`);
            
            buffer = await sharp(buffer)
                .rotate() // Keeps orientation correct
                .jpeg({ 
                    quality: 85, // High visual quality
                    mozjpeg: true, // Best compression algorithm
                    chromaSubsampling: '4:4:4' // High color clarity
                })
                .toBuffer();
                
            console.log(`Compressed size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
        }

        // 3. Upload to Cloudinary
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: "photo-gallery",
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        // 4. Save to Database
        const newImage = await Gallery.create({
            title,
            category,
            size,
            description,
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
        });

        return NextResponse.json({ 
            message: "Image uploaded successfully", 
            data: newImage 
        }, { status: 201 });

    } catch (error: any) {
        console.error("API POST Error:", error);
        return NextResponse.json({ 
            message: "Server error", 
            error: error.message || "Unknown error" 
        }, { status: 500 });
    }
}