import { handleUpload, type HandleUploadOptions } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();
  
  try {
    const options: HandleUploadOptions = {
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      onBeforeGenerateToken: () => ({}),
      onUploadCompleted: () => {},
    };

    const jsonResponse = await handleUpload(options);
    
    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Failed to upload to Vercel Blob' },
      { status: 500 }
    );
  }
} 