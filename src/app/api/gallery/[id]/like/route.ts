import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { Gallery } from "@/models/gallery.model";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectMongo();

    const updatedImage = await Gallery.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!updatedImage) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Like added", likes: updatedImage.likes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Like API Error:", error);
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}
