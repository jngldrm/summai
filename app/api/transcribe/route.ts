import { NextResponse } from 'next/server';

interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  speaker: string;
}

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { audioUrl } = await request.json();

    // Start transcription
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ASSEMBLY_AI_API_KEY || '',
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
          'Authorization': process.env.ASSEMBLY_AI_API_KEY || ''
        }
      });

      if (!pollingResponse.ok) {
        throw new Error(`AssemblyAI polling error: ${pollingResponse.statusText}`);
      }

      transcription = await pollingResponse.json();

      if (transcription.status === 'completed') {
        // Format the response to match our expected interface
        const formattedResponse = {
          words: transcription.words.map((word: TranscriptWord) => ({
            text: word.text,
            start: word.start / 1000,  // Convert to seconds
            end: word.end / 1000,      // Convert to seconds
            speaker: `Speaker ${word.speaker}`
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