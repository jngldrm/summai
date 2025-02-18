'use client';

import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';

interface FileUploadProps {
  onTranscriptionComplete: (data: { text: string }) => void;
}

interface TranscriptionData {
  words: Array<{
    text: string;
    speaker: string;
    start: number;
    end: number;
  }>;
}

export default function FileUpload({ onTranscriptionComplete }: FileUploadProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [status, setStatus] = useState('');

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!inputFileRef.current?.files) {
      throw new Error('No file selected');
    }

    const file = inputFileRef.current.files[0];

    try {
      setStatus(`Uploading file (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload', // Adjust this to your upload handler
      });

      setBlob(newBlob);
      setStatus('Upload complete, starting transcription...');

      const transcriptionResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: newBlob.url }),
      });

      if (!transcriptionResponse.ok) {
        throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`);
      }

      const transcriptionData = await transcriptionResponse.json();
      onTranscriptionComplete(transcriptionData);
      setStatus('Transcription complete!');
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatus(`Error: ${errorMessage}`);
    }
  };

  return (
    <>
      <h1>Upload Your Audio/Video File</h1>

      <form onSubmit={handleUpload}>
        <input name="file" ref={inputFileRef} type="file" accept="video/*,audio/*" required />
        <button type="submit">Upload</button>
      </form>

      {status && (
        <div>
          <p>{status}</p>
        </div>
      )}

      {blob && (
        <div>
          Blob URL: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </>
  );
} 