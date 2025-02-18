import { NextResponse } from 'next/server';

const ASSEMBLY_AI_API_KEY = process.env.ASSEMBLY_AI_API_KEY;

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
        speaker_labels: true,  // Enable speaker diarization
        speakers_expected: 2   // Optional: specify expected number of speakers
      }),
    });

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
      transcription = await pollingResponse.json();

      if (transcription.status === 'completed') {
        // Format the response to match our expected interface
        return NextResponse.json({
          words: transcription.words,
          speakers: [...new Set(transcription.words.map((word: any) => word.speaker))]
        });
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