
import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import ImageAnalyzer from './components/ImageAnalyzer';
import StoryGenerator from './components/StoryGenerator';
import { ChatIcon } from './components/icons/ChatIcon';
import { ImageIcon } from './components/icons/ImageIcon';
import { AudioIcon } from './components/icons/AudioIcon';

type Tab = 'chat' | 'image' | 'story';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <Chatbot />;
      case 'image':
        return <ImageAnalyzer />;
      case 'story':
        return <StoryGenerator />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{
    tabName: Tab;
    label: string;
    children: React.ReactNode;
  }> = ({ tabName, label, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start w-full sm:w-auto text-sm sm:text-base gap-2 px-4 py-3 rounded-lg transition-colors duration-200 ${
        activeTab === tabName
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
      }`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Gemini Multi-Modal Showcase
          </h1>
        </div>
      </header>
      
      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-5xl mx-auto flex flex-col h-full">
          <nav className="mb-6">
            <div className="flex flex-row justify-around sm:justify-start space-x-0 sm:space-x-2 bg-gray-800 p-2 rounded-xl">
              <TabButton tabName="chat" label="AI Chatbot">
                <ChatIcon />
              </TabButton>
              <TabButton tabName="image" label="Image Analyzer">
                <ImageIcon />
              </TabButton>
              <TabButton tabName="story" label="Story Generator">
                <AudioIcon />
              </TabButton>
            </div>
          </nav>
          <div className="flex-grow bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </main>
      
      <footer className="text-center py-4 text-xs text-gray-500">
        Powered by Google Gemini
      </footer>
    </div>
  );
};

export default App;
