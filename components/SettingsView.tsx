import React, { useState, useEffect } from 'react';

interface SettingsViewProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ apiKey, setApiKey }) => {
  const [currentApiKey, setCurrentApiKey] = useState(apiKey);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    setCurrentApiKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(currentApiKey);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Settings</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Gemini API Key</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          To enable AI-powered features like task suggestions, you need to provide your Google Gemini API key. You can get one from Google AI Studio.
          Your key is stored locally in your browser and is never sent to our servers.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="password"
            placeholder="Enter your API Key"
            value={currentApiKey}
            onChange={(e) => setCurrentApiKey(e.target.value)}
            className="flex-grow border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            aria-label="Gemini API Key"
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 w-full sm:w-auto text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            disabled={currentApiKey === apiKey}
          >
            {saveStatus === 'saved' ? 'Saved!' : 'Save'}
          </button>
        </div>
        {apiKey ? (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                API Key is configured.
            </p>
        ) : (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                API Key is not set. AI features are disabled.
            </p>
        )}
      </div>
    </div>
  );
};
