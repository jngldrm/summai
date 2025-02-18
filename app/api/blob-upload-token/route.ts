import { NextResponse } from 'next/server';
import { getToken } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    const clientToken = await getToken({
      pathname: filename,
      contentType,
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    return NextResponse.json(clientToken);
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload token' },
      { status: 500 }
    );
  }
} 