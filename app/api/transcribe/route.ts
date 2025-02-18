import { NextResponse } from 'next/server';

interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  speaker: string;
}

interface AssemblyAIResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  words: TranscriptWord[];
  error?: string;
}

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
        speaker_labels: true,
        language_code: 'de'  // German language
      }),
    });

    const initialData = await response.json();
    const transcriptId = initialData.id;

    // Poll for completion
    let transcription: AssemblyAIResponse;
    while (true) {
      const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': ASSEMBLY_AI_API_KEY || ''
        }
      });
      transcription = await pollingResponse.json();

      if (transcription.status === 'completed') {
        console.log('Raw AssemblyAI response:', JSON.stringify(transcription, null, 2));
        
        // Format the response to match our expected interface
        const formattedResponse = {
          words: transcription.words.map(word => ({
            text: word.text,
            start: word.start / 1000,  // Convert to seconds
            end: word.end / 1000,      // Convert to seconds
            speaker: `Speaker ${word.speaker}`
          })),
          speakers: [...new Set(transcription.words.map(word => `Speaker ${word.speaker}`))]
        };
        
        console.log('Formatted response:', JSON.stringify(formattedResponse, null, 2));
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