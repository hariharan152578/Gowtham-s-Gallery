import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectMongo from "@/lib/db";
import { User } from "@/models/user.model";

export async function POST(req: Request) {
    try {
        await connectMongo();
        const { name, email, password } = await req.json();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return NextResponse.json(
            { message: "User created successfully", user: { id: user._id, name: user.name, email: user.email, role: user.role } },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}
