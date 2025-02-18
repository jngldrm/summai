import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Generate a client token for the browser to upload the file
        console.log('Generating token for:', pathname);
        console.log('Client payload:', clientPayload);

        return {
          allowedContentTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3'], // Adjust as needed
          tokenPayload: JSON.stringify({
            // Optional payload to send back to the client
            // You could pass a user id from auth, or a value from clientPayload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Blob upload completed', blob, tokenPayload);
        // Handle post-upload logic here, e.g., save blob URL to database
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
} 