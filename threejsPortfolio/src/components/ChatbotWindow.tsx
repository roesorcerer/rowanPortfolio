import { useState, useEffect, useRef } from 'react';
import { chatWithRowan, ChatMessage } from '../api/chatService';

interface ChatbotWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const getChatErrorMessage = (error: unknown) => {
  const code = error instanceof Error ? error.message : '';

  if (code === 'OPENAI_KEY_MISSING') {
    return "I’m almost live — OpenAI key is missing. Add `VITE_OPENAI_API_KEY` in `.env.local`, then restart `npm run dev`.";
  }

  if (code === 'OPENAI_KEY_INVALID') {
    return 'Your OpenAI key looks invalid. Generate a new key in the OpenAI dashboard, update `.env.local`, and restart the dev server.';
  }

  if (code === 'OPENAI_BILLING_REQUIRED') {
    return 'OpenAI is rejecting requests due to quota/billing. Check usage + billing in your OpenAI project settings.';
  }

  return 'Oops, something went wrong. Please try again in a moment.';
};

export const ChatbotWindow = ({ isOpen, onClose }: ChatbotWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hey! 👋 I'm Rowan. Feel free to ask me anything about my work, research, or just chat. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithRowan([...messages, userMessage]);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: getChatErrorMessage(error),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-7 right-7 z-50 w-96 max-w-[calc(100vw-2rem)] h-[32rem] flex flex-col bg-black/90 border border-blue-500/30 rounded-lg shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-blue-500/30">
        <div>
          <h3 className="text-white font-semibold">Chat with Rowan</h3>
          <p className="text-xs text-gray-400">Ask me about research, engineering, or anything else</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors text-xl font-bold"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none border border-blue-500/20'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 rounded-lg rounded-bl-none border border-blue-500/20 px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-blue-500/30 p-4 bg-black/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me something..."
            disabled={isLoading}
            className="flex-1 bg-gray-900 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
