import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,  // Disable body parser for large files
    maxDuration: 60,    // Increase timeout to 60 seconds
  },
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('Token:', process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 10) + '...');
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