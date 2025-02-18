import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate and authorize users before generating the token.
        // Otherwise, you're allowing anonymous uploads.

        return {
          allowedContentTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3'], // Adjust as needed
          tokenPayload: JSON.stringify({
            // Optional payload to send back to the client
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        console.log('Blob upload completed', blob);

        try {
          // Run any logic after the file upload completed
          // For example, save the blob URL to a database
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ avatar: blob.url, userId });
        } catch (error) {
          throw new Error('Could not update user');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
} 