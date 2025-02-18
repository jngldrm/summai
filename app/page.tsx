'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Transcription from '@/components/Transcription';
import Summary from '@/components/Summary';

interface TranscriptionResponse {
  text: string;
  utterances: Array<{
    speaker: string;
    text: string;
  }>;
}

export default function Home() {
  const [transcriptionData, setTranscriptionData] = useState<TranscriptionResponse | null>(null);
  const [summary, setSummary] = useState('');

  const handleTranscriptionComplete = (data: TranscriptionResponse) => {
    setTranscriptionData(data);
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">SummAI</h1>
      
      <div className="space-y-8">
        <FileUpload onTranscriptionComplete={handleTranscriptionComplete} />
        
        {transcriptionData && (
          <Transcription data={transcriptionData} />
        )}

        {transcriptionData && (
          <Summary 
            transcriptionData={transcriptionData}
            summary={summary}
            setSummary={setSummary}
          />
        )}
      </div>
    </main>
  );
}
