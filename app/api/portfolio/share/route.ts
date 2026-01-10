import { NextRequest, NextResponse } from "next/server";

// Mock database for shared tokens (In production, use Redis or Postgres)
const shareTokens = new Map<string, string>();

export async function POST(request: NextRequest) {
    try {
        const { studentEmail, studentName } = await request.json();

        if (!studentEmail) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Base64 encode the student name for a simple share token
        // In a real app, generate a secure random token and store it in DB linked to user
        const token = btoa(studentName);

        // Return the public URL
        const publicUrl = `${request.nextUrl.origin}/public/portfolio/${token}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            token: token
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
