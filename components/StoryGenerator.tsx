
import React, { useState } from 'react';
import { fileToBase64 } from '../utils/file';
import { generateStoryFromImage, generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import { Spinner } from './icons/Spinner';
import { AudioIcon } from './icons/AudioIcon';
import { ImageIcon } from './icons/ImageIcon';

const StoryGenerator: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setStory('');
      setError(null);
    }
  };

  const handleGenerateStory = async () => {
    if (!imageFile) {
      setError("Please upload an image first.");
      return;
    }

    setIsGenerating(true);
    setStory('');
    setError(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await generateStoryFromImage(base64Image, imageFile.type);
      setStory(result);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Story generation failed: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReadAloud = async () => {
    if (!story) return;
    setIsReading(true);
    setError(null);

    try {
      const base64Audio = await generateSpeech(story);
      if (!base64Audio) {
        throw new Error("Received no audio data from API.");
      }
      
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
      
      const source = outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContext.destination);
      source.start();
      source.onended = () => {
        setIsReading(false);
        outputAudioContext.close();
      };

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Text-to-speech failed: ${errorMessage}`);
      setIsReading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="md:w-1/2 flex flex-col gap-4">
        <div className="relative border-2 border-dashed border-gray-600 rounded-lg h-64 md:h-full flex items-center justify-center bg-gray-900/50">
          {imagePreview ? (
            <img src={imagePreview} alt="Story inspiration" className="max-h-full max-w-full object-contain rounded-lg" />
          ) : (
            <div className="text-center text-gray-400">
                <ImageIcon className="mx-auto h-12 w-12" />
                <p>Upload an image for story inspiration</p>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          onClick={handleGenerateStory}
          disabled={isGenerating || !imageFile}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-800 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating && <Spinner />}
          {isGenerating ? 'Generating...' : 'Generate Story'}
        </button>
      </div>
      <div className="md:w-1/2 flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-200">Generated Story</h3>
            <button 
                onClick={handleReadAloud}
                disabled={isReading || !story}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg disabled:bg-green-800 disabled:cursor-not-allowed hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
                {isReading ? <Spinner /> : <AudioIcon className="w-4 h-4" />}
                {isReading ? 'Reading...' : 'Read Aloud'}
            </button>
        </div>
        <div className="flex-grow bg-gray-900/70 rounded-lg p-4 overflow-y-auto">
          {error && <p className="text-red-400">{error}</p>}
          {story ? (
            <p className="text-gray-300 whitespace-pre-wrap">{story}</p>
          ) : (
            !isGenerating && <p className="text-gray-500">The generated story will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;
