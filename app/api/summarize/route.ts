import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { transcript, prompt } = await request.json();

    if (!transcript || !prompt) {
      return NextResponse.json(
        { error: 'Missing transcript or prompt' },
        { status: 400 }
      );
    }

    const content = `${prompt}\n\nTranscript:\n${transcript}`;
    console.log('OpenAI Request:', content.slice(0, 100) + '...'); // Log the first 100 chars

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const summary = completion.choices[0]?.message?.content;
    
    if (!summary) {
      throw new Error('No summary generated');
    }

    console.log('OpenAI Response:', summary.slice(0, 100) + '...'); // Log the first 100 chars
    return NextResponse.json({ summary });

  } catch (error: unknown) {
    console.error('Summarization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 