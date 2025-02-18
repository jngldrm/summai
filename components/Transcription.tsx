'use client';

import { useState, useEffect } from 'react';

interface Speaker {
  id: string;
  name: string;
}

interface TranscriptionProps {
  data: {
    words: Array<{
      text: string;
      speaker: string;
      start: number;
      end: number;
    }>;
    speakers: Array<string>;
  };
  speakers: Record<string, string>;
  onSpeakersChange: (speakers: Record<string, string>) => void;
}

export default function Transcription({ data, speakers, onSpeakersChange }: TranscriptionProps) {
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);

  // Group words by speaker and combine into sentences
  const groupedText = data.words.reduce((acc, word) => {
    if (!acc[word.speaker]) {
      acc[word.speaker] = [];
    }
    
    const lastGroup = acc[word.speaker][acc[word.speaker].length - 1];
    const timeDiff = lastGroup ? word.start - lastGroup.end : null;
    
    // Start new group if time difference is more than 1 second
    if (!lastGroup || timeDiff > 1) {
      acc[word.speaker].push({
        text: word.text,
        start: word.start,
        end: word.end
      });
    } else {
      lastGroup.text += ' ' + word.text;
      lastGroup.end = word.end;
    }
    
    return acc;
  }, {} as Record<string, Array<{ text: string; start: number; end: number; }>>);

  const handleSpeakerNameChange = (speaker: string, name: string) => {
    onSpeakersChange({ ...speakers, [speaker]: name });
    setEditingSpeaker(null);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Speaker Names</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.speakers.map((speaker) => (
            <div key={speaker} className="flex items-center space-x-2">
              {editingSpeaker === speaker ? (
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm w-full"
                  value={speakers[speaker] || ''}
                  onChange={(e) => handleSpeakerNameChange(speaker, e.target.value)}
                  onBlur={() => setEditingSpeaker(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSpeakerNameChange(speaker, e.currentTarget.value);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setEditingSpeaker(speaker)}
                  className="border rounded px-2 py-1 text-sm w-full hover:bg-gray-50"
                >
                  {speakers[speaker] || speaker}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedText).map(([speaker, utterances]) => (
          <div key={speaker} className="space-y-2">
            {utterances.map((utterance, index) => (
              <div key={index} className="flex space-x-4">
                <div className="text-gray-500 text-sm w-16">
                  {formatTime(utterance.start)}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-blue-600">
                    {speakers[speaker] || speaker}:
                  </span>{' '}
                  <span>{utterance.text}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 