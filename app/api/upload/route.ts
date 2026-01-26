import { NextRequest, NextResponse } from "next/server";
import { uploadEvidenceFile } from "@/lib/storage";
import { auth } from "@/lib/auth/config";

// Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
            return NextResponse.json(
                { error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
                { status: 400 }
            );
        }

        // Convert File to Buffer for R2 upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudflare R2
        const result = await uploadEvidenceFile(
            buffer,
            file.name,
            file.type,
            session.user.email
        );

        return NextResponse.json({
            success: true,
            url: result.url,
            fileName: result.fileName,
            fileType: result.fileType,
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Internal server error during upload" },
            { status: 500 }
        );
    }
}
