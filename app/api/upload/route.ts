import { NextResponse } from 'next/server';
import { blob } from '@vercel/blob';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  try {
    const { url } = await blob.upload({
      data: file,
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return NextResponse.json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Failed to upload to Vercel Blob' },
      { status: 500 }
    );
  }
} 