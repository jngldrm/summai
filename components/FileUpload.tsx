'use client';

import { useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { upload } from '@vercel/blob/client';

const ffmpeg = new FFmpeg();

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
  speakers: string[];
}

export default function FileUpload({ onTranscriptionComplete }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const convertToMp3 = async (file: File) => {
    if (!ffmpeg.loaded) {
      setStatus('Loading FFmpeg...');
      await ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
      });
    }

    try {
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));
      
      // Add progress handler
      ffmpeg.setProgress(({ ratio }) => {
        setProgress(Math.round(ratio * 100));
      });

      await ffmpeg.run('-i', 'input.mp4', '-vn', '-acodec', 'libmp3lame', '-ab', '128k', 'output.mp3');
      const mp3Data = ffmpeg.FS('readFile', 'output.mp3');
      
      // Clean up
      ffmpeg.FS('unlink', 'input.mp4');
      ffmpeg.FS('unlink', 'output.mp3');
      
      return new Blob([mp3Data.buffer], { type: 'audio/mp3' });
    } catch (error) {
      throw new Error(`FFmpeg conversion failed: ${error.message}`);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      setStatus('Error: File size must be less than 100MB');
      return;
    }

    try {
      setIsLoading(true);
      setProgress(0);
      
      setStatus('Converting to MP3...');
      const mp3Blob = await convertToMp3(file);

      setStatus('Uploading to Vercel Blob...');
      const { url } = await upload(mp3Blob, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setStatus('Transcribing with AssemblyAI...');
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: url }),
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const transcriptionData = await response.json();
      onTranscriptionComplete(transcriptionData);
      setStatus('Transcription complete!');
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`Error: ${error.message}`);
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
          {isLoading ? 'Processing...' : 'Select MP4 File'}
        </label>
        <input
          id="file-upload"
          type="file"
          accept="video/mp4"
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