import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto relative">
        <form 
          onSubmit={handleSubmit}
          className="flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Smiota smart lockers..."
            className="flex-1 max-h-[120px] min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-3 text-gray-800 placeholder-gray-400"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl flex-shrink-0 transition-colors
              ${input.trim() && !isLoading 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            aria-label="Send message"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-xs text-gray-400">
            Press Enter to send, Shift + Enter for new line.
          </span>
        </div>
      </div>
    </div>
  );
};
