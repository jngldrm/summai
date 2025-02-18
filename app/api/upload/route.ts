import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Increase timeout and disable body parser for large files
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('Starting upload process...');
    console.log('File details:', {
      name: file?.name,
      size: file?.size,
      type: file?.type
    });
    
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

    console.log('Starting Vercel Blob upload...');
    try {
      const { url } = await put(file.name, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false, // Prevent random suffixes for easier debugging
      });
      console.log('Upload successful, URL:', url);
      return NextResponse.json({ url });
    } catch (blobError) {
      console.error('Blob upload error:', blobError);
      throw blobError; // Re-throw to be caught by outer try-catch
    }
  } catch (err) {
    console.error('Upload error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      name: err instanceof Error ? err.name : 'Unknown',
      stack: err instanceof Error ? err.stack : undefined
    });
    
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to upload to Vercel Blob' },
      { status: 500 }
    );
  }
} 