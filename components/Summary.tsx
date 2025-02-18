'use client';

import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SummaryProps {
  transcriptionData: {
    words: Array<{
      text: string;
      start: number;
      end: number;
      speaker: string;
    }>;
  };
  summary: string;
  setSummary: (summary: string) => void;
}

export default function Summary({ transcriptionData, summary, setSummary }: SummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState(
    "Please provide a concise summary of this conversation, highlighting the main points discussed and any important conclusions or action items."
  );
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    
    try {
      // Prepare the transcript text with speaker names
      const transcript = transcriptionData.words
        .reduce((acc, word, index, array) => {
          const currentSpeaker = word.speaker;
          const prevSpeaker = index > 0 ? array[index - 1].speaker : null;
          
          if (word.speaker !== prevSpeaker) {
            acc += `\n${currentSpeaker}: `;
          }
          acc += `${word.text} `;
          return acc;
        }, '');

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Summary generation error:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Customizable Prompt
        </label>
        <textarea
          id="prompt"
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <button
        onClick={generateSummary}
        disabled={isLoading}
        className={`
          w-full py-2 px-4 rounded-md text-white font-medium
          ${isLoading 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        {isLoading ? 'Generating Summary...' : 'Generate Summary'}
      </button>

      {summary && (
        <div className="relative mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="prose max-w-none">{summary}</div>
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ClipboardIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
} 