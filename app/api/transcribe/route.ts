import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY || ''
});

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { audioUrl } = await request.json();

    const params = {
      audio: audioUrl,
      speaker_labels: true,
      language_code: 'de'
    };

    const transcript = await client.transcripts.transcribe(params);

    if (!transcript.utterances) {
      throw new Error('No utterances found in transcript');
    }

    // Format the response with speaker labels
    const formattedResponse = {
      text: transcript.text,
      utterances: transcript.utterances.map(utterance => ({
        speaker: utterance.speaker,
        text: utterance.text
      }))
    };

    return NextResponse.json(formattedResponse);
  } catch (error: unknown) {
    console.error('Transcription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 