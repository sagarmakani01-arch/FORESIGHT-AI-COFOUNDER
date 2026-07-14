import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabase) return supabase;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  contentType?: string
): Promise<{ url: string; path: string }> {
  const client = getSupabaseClient();

  const fileData = file instanceof File ? file : Buffer.from(file);
  const options: { contentType?: string; upsert?: boolean } = {
    upsert: true,
  };
  if (contentType) {
    options.contentType = contentType;
  }

  const { error } = await client.storage.from(bucket).upload(path, fileData, options);
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const url = getFileUrl(bucket, path);
  return { url, path };
}

export function getFileUrl(bucket: string, path: string): string {
  const client = getSupabaseClient();
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const client = getSupabaseClient();
  const { error } = await client.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
  return true;
}

export async function listFiles(
  bucket: string,
  folder?: string
): Promise<Array<{ name: string; id: string; size: number; createdAt: string }>> {
  const client = getSupabaseClient();
  const path = folder ? `${folder}/` : '';

  const { data, error } = await client.storage.from(bucket).list(path, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return (data || []).map((item) => ({
    name: item.name,
    id: item.id ?? '',
    size: item.metadata?.size || 0,
    createdAt: item.created_at || new Date().toISOString(),
  }));
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getSupabaseClient();
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) {
    throw new Error(`Signed URL failed: ${error.message}`);
  }
  return data.signedUrl;
}

export function createStorageClient(url?: string, key?: string): SupabaseClient {
  return createClient(url || SUPABASE_URL, key || SUPABASE_ANON_KEY);
}
