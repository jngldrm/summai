'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';

interface FileUploadProps {
  onTranscriptionComplete: (data: TranscriptionData) => void;
}

interface TranscriptionData {
  words: Array<{
    text: string;
    speaker: string;
    start: number;
    end: number;
  }>;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileUpload({ onTranscriptionComplete }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setStatus('Error: File size must be less than 50MB');
      return;
    }

    try {
      setIsLoading(true);
      setProgress(0);
      
      setStatus(`Uploading file (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

      // Get the client upload token and handle upload in one step
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload token');
      }

      const { tokenUrl, clientToken } = await response.json();

      // Upload directly to Vercel Blob
      const { url } = await upload(file.name, file, {
        onProgress: (progress) => {
          setProgress(Math.round(progress * 100));
        },
      });

      setStatus('Upload complete, starting transcription...');

      const transcriptionResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: url }),
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
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
      <div className="flex flex-col items-center">
        <label 
          htmlFor="file-upload"
          className={`
            cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg
            hover:bg-blue-600 transition-colors
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? 'Processing...' : 'Select Video File'}
        </label>
        <input
          id="file-upload"
          type="file"
          accept="video/*,audio/*"
          onChange={handleUpload}
          disabled={isLoading}
          className="hidden"
        />
        
        {status && (
          <div className="mt-4 text-sm">
            <p className={`
              ${status.includes('Error') ? 'text-red-500' : 'text-gray-600'}
            `}>
              {status}
            </p>
            {progress > 0 && progress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 