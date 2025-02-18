import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();
  
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload to Vercel Blob' },
      { status: 500 }
    );
  }
} 