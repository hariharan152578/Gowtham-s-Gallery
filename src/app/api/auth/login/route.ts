import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectMongo from "@/lib/db";
import { User } from "@/models/user.model";
import { generateToken } from "@/lib/jwt";

export async function POST(req: Request) {
    try {
        await connectMongo();
        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
        }

        const token = generateToken(user._id.toString());
        return NextResponse.json(
            { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}
