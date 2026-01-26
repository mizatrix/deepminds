'use server';

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'evidence-files';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!; // Your custom domain or R2.dev URL

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Upload a file to Cloudflare R2 Storage
 * Returns the public URL of the uploaded file
 */
export async function uploadEvidenceFile(
    fileBuffer: Buffer,
    fileName: string,
    fileType: string,
    studentEmail: string
): Promise<{ url: string; fileName: string; fileType: string }> {
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedEmail = studentEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = `${sanitizedEmail}/${timestamp}_${fileName}`;

    // Upload to R2
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: filePath,
        Body: fileBuffer,
        ContentType: fileType,
        CacheControl: 'max-age=3600',
    });

    try {
        await s3Client.send(command);
    } catch (error) {
        console.error('R2 upload error:', error);
        throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Construct public URL
    const publicUrl = `${R2_PUBLIC_URL}/${filePath}`;

    return {
        url: publicUrl,
        fileName: fileName,
        fileType: fileType,
    };
}

/**
 * Delete a file from Cloudflare R2 Storage
 */
export async function deleteEvidenceFile(filePath: string): Promise<void> {
    // Extract the key from the full URL if needed
    let key = filePath;
    if (filePath.startsWith(R2_PUBLIC_URL)) {
        key = filePath.replace(`${R2_PUBLIC_URL}/`, '');
    }

    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    try {
        await s3Client.send(command);
    } catch (error) {
        console.error('R2 delete error:', error);
        throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
