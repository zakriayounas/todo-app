import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { excludePasswordField } from "../../../../services/users";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await compare(password, user.password))) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return NextResponse.json({ user: excludePasswordField(user), token }, { status: 200 });

    } catch (error) {
        console.error("Login message:", error);
        return NextResponse.json({ message: error?.message || "Something went wrong during login." }, { status: 500 });
    }
}
