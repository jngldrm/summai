import { NextResponse } from 'next/server';

const ASSEMBLY_AI_API_KEY = process.env.ASSEMBLY_AI_API_KEY;

export async function POST(request: Request) {
  try {
    const { audioUrl } = await request.json();

    // Start transcription
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLY_AI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speaker_labels: true,
      }),
    });

    const initialData = await response.json();
    const transcriptId = initialData.id;

    // Poll for completion
    let transcription;
    while (true) {
      const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'Authorization': ASSEMBLY_AI_API_KEY },
      });
      transcription = await pollingResponse.json();

      if (transcription.status === 'completed') break;
      if (transcription.status === 'error') throw new Error('Transcription failed');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return NextResponse.json(transcription);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 