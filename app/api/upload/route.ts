import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Increase timeout and disable body parser for large files
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('File:', file ? `${file.name} (${file.size} bytes)` : 'No file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const { url } = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return NextResponse.json({ url });
  } catch (err) {
    console.error('Upload error details:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to upload to Vercel Blob' },
      { status: 500 }
    );
  }
} 