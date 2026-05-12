import { NextRequest, NextResponse } from "next/server";
import { uploadEvidenceFile } from "@/lib/storage";
import { auth } from "@/lib/auth/config";
import { upload } from "@/lib/config";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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

        if (file.size > upload.maxSizeBytes) {
            return NextResponse.json(
                { error: `File too large. Maximum size is ${upload.maxSizeMB}MB` },
                { status: 400 }
            );
        }

        if (!upload.allowedMimeTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed types: ${upload.allowedExtensions.join(', ')}` },
                { status: 400 }
            );
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !upload.allowedExtensions.includes(extension)) {
            return NextResponse.json(
                { error: `Invalid file extension. Allowed: ${upload.allowedExtensions.join(', ')}` },
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
