'use client';

import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'evidence-files';

/**
 * Upload a file to Supabase Storage
 * Returns the public URL of the uploaded file
 */
export async function uploadEvidenceFile(
    file: File,
    studentEmail: string
): Promise<{ url: string; fileName: string; fileType: string }> {
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedEmail = studentEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const fileExt = file.name.split('.').pop() || 'file';
    const fileName = `${sanitizedEmail}/${timestamp}_${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return {
        url: publicUrl,
        fileName: file.name,
        fileType: file.type,
    };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteEvidenceFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
    }
}
