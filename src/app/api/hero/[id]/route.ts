import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import Hero from "@/models/hero.model";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectMongo();
        const image = await Hero.findById(id);
        if (!image) {
            return NextResponse.json({ message: "Hero image not found" }, { status: 404 });
        }
        return NextResponse.json({ data: image }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = req.headers.get("authorization");
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
        }

        const { id } = await params;
        await connectMongo();
        
        // For hero images, we usually just update whether it's active or not
        const { isActive } = await req.json();

        const updatedImage = await Hero.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!updatedImage) {
            return NextResponse.json({ message: "Hero image not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Hero image updated successfully", data: updatedImage }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = req.headers.get("authorization");
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
        }

        const { id } = await params;
        await connectMongo();
        const image = await Hero.findById(id);
        if (!image) {
            return NextResponse.json({ message: "Hero image not found" }, { status: 404 });
        }

        // Remove from Cloudinary using the publicId
        if (image.publicId) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        // Remove from MongoDB
        await Hero.findByIdAndDelete(id);

        return NextResponse.json({ message: "Hero image deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}