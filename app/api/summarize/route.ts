import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { transcript, prompt } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates clear and concise summaries of conversations."
        },
        {
          role: "user",
          content: `${prompt}\n\nTranscript:\n${transcript}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const summary = completion.choices[0].message.content;
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
} 