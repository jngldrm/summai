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
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {data.words.map((word, index) => (
        <div key={index} className="flex space-x-4">
          <div className="text-gray-500 text-sm w-16">
            {formatTime(word.start)}
          </div>
          <div className="flex-1">
            <span>{word.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
} 