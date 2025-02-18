'use client';

interface TranscriptionProps {
  data: {
    words: Array<{
      text: string;
      start: number;
      end: number;
      speaker: string;
    }>;
  };
}

export default function Transcription({ data }: TranscriptionProps) {
  // Combine all words into a single text
  const text = data.words.map(word => word.text).join(' ');

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="text-gray-800 whitespace-pre-wrap">{text}</p>
    </div>
  );
} 