import { NextResponse } from "next/server";
import { extractUserId } from "../../../../services/users";
import { prisma } from "../../../../lib/prisma";

export async function GET(req) {
    try {
        const userId = extractUserId(req);
        const todos = await prisma.todo.findMany({
            where: { userId }, include: {
                pomodoroSessions: true
            }
        });
        return NextResponse.json(todos);
    } catch (error) {
        console.error("GET todos message:", error);
        return NextResponse.json({ message: error.message || "Failed to fetch todos" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const userId = extractUserId(req);
        const { title, description, isCompleted } = await req.json();
        const todo = await prisma.todo.create({
            data: { title, description, userId, isCompleted },
        });

        return NextResponse.json(todo, { status: 201 });
    } catch (error) {
        console.error("POST todo message:", error);
        return NextResponse.json({ message: error.message || "Failed to create todo" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {

        const userId = extractUserId(req);
        const { id, ...data } = await req.json();
        const existingTodo = await prisma.todo.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (!existingTodo) {
            return NextResponse.json({ message: "Todo not found" }, { status: 404 });
        }
        if (existingTodo.userId !== userId) {
            return NextResponse.json(
                { message: "Unauthorized to updated this todo" },
                { status: 403 }
            );
        }

        const todo = await prisma.todo.update({
            where: { id: parseInt(id, 10) },
            data,
        });

        return NextResponse.json(todo);
    } catch (error) {
        console.error("PUT todo update message:", error);
        return NextResponse.json({ message: error.message || "Failed to update todo" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const userId = extractUserId(req);
        const { id } = await req.json();
        const existingTodo = await prisma.todo.findUnique({
            where: { id: parseInt(id, 10) },
        });


        if (!existingTodo) {
            return NextResponse.json({ message: "Todo not found" }, { status: 404 });
        }
        if (existingTodo.userId !== userId) {
            return NextResponse.json(
                { message: "Unauthorized to updated this todo" },
                { status: 403 }
            );
        }
        // Delete associated pomodoro first
        await prisma.pomodoroSession.deleteMany({
            where: { todoId: parseInt(id, 10) },
        });

        // Then delete the todo
        await prisma.todo.delete({
            where: { id: parseInt(id, 10) },
        });

        return NextResponse.json({ message: "Todo and its Pomodoro deleted successfully" });
    } catch (error) {
        console.error("DELETE todo message:", error);
        return NextResponse.json({ message: error.message || "Failed to delete todo" }, { status: 500 });
    }
}
