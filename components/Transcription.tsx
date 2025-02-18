'use client';

interface TranscriptionProps {
  data: {
    text: string;
    utterances: Array<{
      text: string;
      speaker: string;
      start: number;
      end: number;
    }>;
  };
}

export default function Transcription({ data }: TranscriptionProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {data.utterances.map((utterance, index) => (
        <div key={index} className="mb-2">
          <span className="font-bold text-blue-600">Speaker {utterance.speaker}: </span>
          <span className="text-gray-800">{utterance.text}</span>
        </div>
      ))}
    </div>
  );
} 