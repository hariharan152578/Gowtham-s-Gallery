import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { Gallery } from "@/models/gallery.model";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectMongo();
        const image = await Gallery.findById(id);
        if (!image) {
            return NextResponse.json({ message: "Image not found" }, { status: 404 });
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
        const { title, category, size, description } = await req.json();

        const updatedImage = await Gallery.findByIdAndUpdate(
            id,
            { title, category, size, description },
            { new: true }
        );

        if (!updatedImage) {
            return NextResponse.json({ message: "Image not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Image updated successfully", data: updatedImage }, { status: 200 });
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
        const image = await Gallery.findById(id);
        if (!image) {
            return NextResponse.json({ message: "Image not found" }, { status: 404 });
        }

        if (image.publicId) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        await Gallery.findByIdAndDelete(id);

        return NextResponse.json({ message: "Image deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}
