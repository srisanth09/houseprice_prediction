import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Package, RefreshCw, AlertCircle } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { geminiService } from './services/geminiService';
import { Message, ChatState } from './types';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: 'model',
  text: "Hello! I'm the Smiota Smart Assistant. How can I help you today with our smart locker solutions or mailroom automation?",
  timestamp: new Date(),
};

export default function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [INITIAL_MESSAGE],
    isLoading: false,
    error: null,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on mount
  useEffect(() => {
    try {
      geminiService.initChat();
    } catch (err: any) {
      setChatState(prev => ({ ...prev, error: err.message || "Failed to initialize chat." }));
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  const handleSendMessage = useCallback(async (text: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newUserMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const responseText = await geminiService.sendMessage(text);
      
      const newModelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, newModelMessage],
        isLoading: false,
      }));
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to get a response. Please try again.",
      }));
    }
  }, []);

  const handleResetChat = () => {
    geminiService.resetChat();
    setChatState({
      messages: [INITIAL_MESSAGE],
      isLoading: false,
      error: null,
    });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-white shadow-2xl sm:rounded-xl sm:my-4 overflow-hidden border border-gray-200">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Smiota Assistant</h1>
            <p className="text-xs text-gray-500 font-medium">Smart Locker Solutions</p>
          </div>
        </div>
        <button
          onClick={handleResetChat}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
          title="Reset Conversation"
        >
          <RefreshCw size={18} />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          {chatState.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {chatState.isLoading && (
            <div className="flex justify-start mb-6">
              <div className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {chatState.error && (
            <div className="flex justify-center mb-6">
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                <AlertCircle size={16} />
                <span>{chatState.error}</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={chatState.isLoading} />
      
    </div>
  );
}
