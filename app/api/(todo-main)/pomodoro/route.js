import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { extractUserId } from "../../../../services/users";
export async function POST(req) {
    try {
        const body = await req.json();

        const userId = extractUserId(req);
        const { todoId, duration } = body;

        if (!todoId || !duration) {
            return NextResponse.json(
                { message: "Missing todoId or duration" },
                { status: 400 }
            );
        }

        const todo = await prisma.todo.findFirst({
            where: { id: parseInt(todoId, 10) },
        });

        if (!todo) {
            return NextResponse.json({ message: "Todo not found" }, { status: 404 });
        }
        if (todo.userId !== userId) {
            return NextResponse.json(
                { message: "Unauthorized to updated this todo" },
                { status: 403 }
            );
        }
        const pomodoro = await prisma.pomodoroSession.create({
            data: {
                todoId,
                duration,
            },
        });

        return NextResponse.json(
            { message: "Pomodoro created successfully", pomodoro },
            { status: 201 }
        );
    } catch (error) {
        console.error("Pomodoro creation message:", error);
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
