
import React, { useState } from 'react';
import { fileToBase64 } from '../utils/file';
import { analyzeImageWithGemini } from '../services/geminiService';
import { Spinner } from './icons/Spinner';
import { ImageIcon } from './icons/ImageIcon';

const ImageAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResponse('');
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !prompt.trim()) {
      setError("Please upload an image and enter a prompt.");
      return;
    }

    setIsLoading(true);
    setResponse('');
    setError(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await analyzeImageWithGemini(base64Image, imageFile.type, prompt);
      setResponse(result);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="md:w-1/2 flex flex-col gap-4">
        <div className="relative border-2 border-dashed border-gray-600 rounded-lg h-64 md:h-full flex items-center justify-center bg-gray-900/50">
          {imagePreview ? (
            <img src={imagePreview} alt="Upload preview" className="max-h-full max-w-full object-contain rounded-lg" />
          ) : (
            <div className="text-center text-gray-400">
                <ImageIcon className="mx-auto h-12 w-12" />
                <p>Upload an image to analyze</p>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What do you want to know about the image?"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          rows={3}
        />
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !imageFile || !prompt.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-800 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <Spinner />}
          {isLoading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </div>
      <div className="md:w-1/2 flex flex-col">
        <h3 className="text-lg font-semibold mb-2 text-gray-200">Analysis Result</h3>
        <div className="flex-grow bg-gray-900/70 rounded-lg p-4 overflow-y-auto">
          {error && <p className="text-red-400">{error}</p>}
          {response ? (
            <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
          ) : (
            !isLoading && <p className="text-gray-500">The analysis will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
