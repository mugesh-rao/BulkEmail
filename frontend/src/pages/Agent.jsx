import React, { useState } from 'react';
import axios from 'axios';

const AgentChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      // Add user message to chat
      const userMessage = { type: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);
      
      // Send to server
      const res = await axios.post('http://localhost:5000/ask', { message: input });
      
      // Add AI response to chat
      const aiMessage = { 
        type: 'ai', 
        content: res.data.output,
        language: res.data.language 
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Clear input
      setInput('');
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <h2 className="text-2xl font-bold text-gray-800">AI Assistant</h2>
        <p className="text-sm text-gray-600">Supports English and Spanish</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-white shadow-md'
              }`}
            >
              {message.type === 'ai' && (
                <div className="text-xs text-gray-500 mb-1">
                  {message.language === 'spanish' ? 'Spanish' : 'English'} Response
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message in English or Spanish..."
            className="flex-1 border border-gray-300 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="2"
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`px-6 rounded-r-lg font-medium ${
              loading || !input.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
