import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { excludePasswordField } from "../../../../services/users";
export async function POST(req) {
    try {
        const { email, password, name } = await req.json();

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: "Email already in use" }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        return NextResponse.json({ user: excludePasswordField(user) }, { status: 201 });

    } catch (error) {
        console.error("Signup message:", error);
        return NextResponse.json({ message: error?.message || "Failed to register user" }, { status: 500 });
    }
}
