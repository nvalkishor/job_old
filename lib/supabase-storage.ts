// lib/supabase-storage.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function uploadFile(bucket: string, path: string, file: File) {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
        .storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
    }

    return data;
}

export function getPublicUrl(bucket: string, path: string) {
    const supabase = createClientComponentClient();

    const { data } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(path);

    return data.publicUrl;
}