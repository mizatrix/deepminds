import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export const dynamic = 'force-dynamic';

/**
 * Proxy route for serving R2 evidence files through the same domain.
 * This avoids CORS issues when previewing files in the admin panel.
 * Usage: /api/evidence?url=<encoded-r2-url>
 */
export async function GET(request: NextRequest) {
    try {
        // Require authentication
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = request.nextUrl.searchParams.get("url");
        if (!url) {
            return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
        }

        // Only allow proxying from our R2 bucket domain
        const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').trim();
        if (!url.startsWith(R2_PUBLIC_URL) && !url.startsWith('https://pub-80f17c46cf88433cb27a022bbe2a5b95.r2.dev')) {
            return NextResponse.json({ error: "Invalid URL" }, { status: 403 });
        }

        // Fetch the file from R2
        const response = await fetch(url);
        if (!response.ok) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const body = await response.arrayBuffer();

        return new NextResponse(body, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        console.error("Evidence proxy error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
