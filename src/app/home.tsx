'use client';

import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import AssistantFiles from './components/AssistantFiles';
import ErrorMessage from './components/ErrorMessage';
import { File, Reference, Message } from './types';

interface HomeProps {
  initialShowAssistantFiles: boolean;
  showCitations: boolean;
}

export default function Home({ initialShowAssistantFiles, showCitations }: HomeProps) {
  const [loading, setLoading] = useState(true);
  const [assistantExists, setAssistantExists] = useState(false);
  const [error, setError] = useState('');
  const [assistantName, setAssistantName] = useState('');
  const [referencedFiles, setReferencedFiles] = useState<Reference[]>([]);
  const [showAssistantFiles, setShowAssistantFiles] = useState(initialShowAssistantFiles);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    checkAssistant();
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      if (data.status === 'success') {
        setFiles(data.files);
      } else {
        console.error('Error fetching files:', data.message);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const checkAssistant = async () => {
    try {
      const response = await fetch('/api/assistants')
      const data = await response.json()
      
      setLoading(false)
      setAssistantExists(data.exists)
      setAssistantName(data.assistant_name)
      if (!data.exists) {
        setError('Please create an Assistant')
      }
    } catch (error) {
      setLoading(false)
      setError('Error connecting to the Assistant')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50 dark:bg-gray-900">
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900 mb-4"></div>
          <p className="text-gray-500">Connecting to your Assistant...</p>
        </div>
      ) : assistantExists ? (
        <div className="w-full max-w-6xl xl:max-w-7xl h-full">
          <h1 className="text-2xl font-bold mb-4 text-indigo-900 dark:text-indigo-100">
            <a href="https://www.pinecone.io/blog/pinecone-assistant/" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Pinecone Assistant
            </a>: {assistantName} <span className="text-green-500">●</span>
          </h1>
          <div className="flex flex-col gap-4">
            <ChatInterface
              messages={messages}
              setMessages={setMessages}
              isStreaming={isStreaming}
              setIsStreaming={setIsStreaming}
              setError={setError}
            />
            {error && <ErrorMessage error={error} />}
            {showAssistantFiles && (
              <div className="w-full">
                <AssistantFiles files={files} referencedFiles={referencedFiles} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-2xl">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-semibold">Error</p>
          </div>
          <p className="mt-2">{error}</p>
          <div className="mt-4 text-sm">
            <p className="font-semibold">To resolve this issue:</p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
              <li>Create a Pinecone Assistant at <a href="https://app.pinecone.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://app.pinecone.io</a></li>
              <li>Export the environment variable <code className="bg-red-200 px-1 rounded">PINECONE_ASSISTANT_NAME</code> with the value of your assistant&apos;s name</li>
              <li>Restart your application</li>
            </ol>
          </div>
        </div>
      )}
      <div className="mt-8 text-sm text-gray-500 flex space-x-4">
        <a href="https://www.pinecone.io/blog/pinecone-assistant/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
          ℹ️ What are Pinecone Assistants?
        </a>
        <a href="https://app.pinecone.io" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
          🤖 Create your own Pinecone Assistant today
        </a>
      </div>
    </main>
  );
}