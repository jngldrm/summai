'use client';

interface TranscriptionProps {
  data: {
    text: string;
  };
}

export default function Transcription({ data }: TranscriptionProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="text-gray-800 whitespace-pre-wrap">{data.text}</p>
    </div>
  );
} 