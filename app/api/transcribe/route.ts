import { NextResponse } from 'next/server';

const ASSEMBLY_AI_API_KEY = process.env.ASSEMBLY_AI_API_KEY;

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { audioUrl } = await request.json();

    // Start transcription
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLY_AI_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speaker_labels: true,
        language_code: 'de'
      }),
    });

    if (!response.ok) {
      throw new Error(`AssemblyAI API error: ${response.statusText}`);
    }

    const initialData = await response.json();
    const transcriptId = initialData.id;

    // Poll for completion
    let transcription;
    while (true) {
      const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': ASSEMBLY_AI_API_KEY || ''
        }
      });

      if (!pollingResponse.ok) {
        throw new Error(`AssemblyAI polling error: ${pollingResponse.statusText}`);
      }

      transcription = await pollingResponse.json();

      // Log the entire transcription response for debugging
      console.log('Transcription response:', transcription);

      if (transcription.status === 'completed') {
        if (!transcription.words) {
          throw new Error('Transcription completed but no words found');
        }

        // Format the response to include speaker labels and text
        const formattedResponse = {
          text: transcription.text,
          words: transcription.words.map((word) => ({
            text: word.text,
            start: word.start / 1000,
            end: word.end / 1000,
            speaker: word.speaker
          }))
        };

        return NextResponse.json(formattedResponse);
      }
      
      if (transcription.status === 'error') {
        throw new Error(transcription.error || 'Transcription failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  } catch (error: unknown) {
    console.error('Transcription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 