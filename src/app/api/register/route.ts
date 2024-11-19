import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongo";
import User from "@/models/User";
import { z } from "zod";
import { NextResponse } from "next/server";

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { name, email, password } = registerSchema.parse(body);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });

        await newUser.save();
        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
