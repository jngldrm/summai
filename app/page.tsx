'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Transcription from '@/components/Transcription';
import Summary from '@/components/Summary';

interface TranscriptionData {
  words: Array<{
    text: string;
    speaker: string;
    start: number;
    end: number;
  }>;
  speakers: string[];
}

export default function Home() {
  const [transcriptionData, setTranscriptionData] = useState<TranscriptionData | null>(null);
  const [speakers, setSpeakers] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState('');

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">SummAI</h1>
      
      <div className="space-y-8">
        <FileUpload onTranscriptionComplete={setTranscriptionData} />
        
        {transcriptionData && (
          <Transcription 
            data={transcriptionData} 
            speakers={speakers}
            onSpeakersChange={setSpeakers}
          />
        )}

        {transcriptionData && (
          <Summary 
            transcriptionData={transcriptionData}
            speakers={speakers}
            summary={summary}
            setSummary={setSummary}
          />
        )}
      </div>
    </main>
  );
}
