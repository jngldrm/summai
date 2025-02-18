'use client';

interface TranscriptionProps {
  data: {
    text: string;
    utterances: Array<{
      speaker: string;
      text: string;
    }>;
  };
}

export default function Transcription({ data }: TranscriptionProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        {data.utterances.map((utterance, index) => (
          <div key={index} className="text-gray-800">
            <span className="font-bold">{utterance.speaker}: </span>
            <span className="whitespace-pre-wrap">{utterance.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 