import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { Portfolio } from "@/models/portfolio.model";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
    try {
        await connectMongo();
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            return NextResponse.json({ message: "Portfolio not found" }, { status: 404 });
        }
        return NextResponse.json({ data: portfolio }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const token = req.headers.get("authorization");
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
        }

        await connectMongo();
        
        // Use formData instead of json
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const bio = formData.get("bio") as string;
        const experienceYears = formData.get("experienceYears") as string;
        const instagram = formData.get("instagram") as string;
        const facebook = formData.get("facebook") as string;
        const imageFile = formData.get("image") as File | null;

        let portfolio = await Portfolio.findOne();
        
        // Keep existing image data by default
        let newImageUrl = portfolio?.profileImage;
        let newPublicId = portfolio?.publicId;

        // If a new image was uploaded, process it
        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "portfolio-profile" }, // Dedicated folder
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });

            // Delete the old profile image from Cloudinary to save space
            if (portfolio?.publicId) {
                await cloudinary.uploader.destroy(portfolio.publicId);
            }

            newImageUrl = uploadResult.secure_url;
            newPublicId = uploadResult.public_id;
        }

        // Update existing portfolio
        if (portfolio) {
            portfolio.name = name || portfolio.name;
            portfolio.bio = bio || portfolio.bio;
            portfolio.experienceYears = experienceYears ? Number(experienceYears) : portfolio.experienceYears;
            portfolio.instagram = instagram || portfolio.instagram;
            portfolio.facebook = facebook || portfolio.facebook;
            
            if (newImageUrl) portfolio.profileImage = newImageUrl;
            if (newPublicId) portfolio.publicId = newPublicId;

            const updatedPortfolio = await portfolio.save();
            return NextResponse.json({ message: "Portfolio updated successfully", data: updatedPortfolio }, { status: 200 });
        }

        // Create new portfolio if it doesn't exist
        const newPortfolio = await Portfolio.create({
            name,
            bio,
            experienceYears: Number(experienceYears),
            instagram,
            facebook,
            profileImage: newImageUrl,
            publicId: newPublicId
        });

        return NextResponse.json({ message: "Portfolio created successfully", data: newPortfolio }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}