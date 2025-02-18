'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Transcription from '@/components/Transcription';
import Summary from '@/components/Summary';

// Define the interface to match what we're getting from the API
interface TranscriptionData {
  text: string;
}

export default function Home() {
  const [transcriptionData, setTranscriptionData] = useState<TranscriptionData | null>(null);
  const [summary, setSummary] = useState('');

  // Create a handler function to update the state
  const handleTranscriptionComplete = (data: TranscriptionData) => {
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
            transcriptionData={{ words: [{ text: transcriptionData.text, start: 0, end: 0, speaker: '' }] }}
            summary={summary}
            setSummary={setSummary}
          />
        )}
      </div>
    </main>
  );
}
