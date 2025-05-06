import { useState } from 'react';

function AgentsOpus() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    const userMsg = { role: 'user', content: message };
    setChat([...chat, userMsg]);
    setMessage('');

    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    const botMsg = { role: 'assistant', content: data.reply };
    setChat(prev => [...prev, botMsg]);
  };

  return (
    <div className="flex flex-col h-screen bg-blue-500 p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white">Your AI Assistant</h1>
        <p className="text-lg text-gray-200">Ask anything and get instant responses!</p>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-lg shadow-lg">
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-lg p-3 transition-transform duration-300 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 shadow-md'}`}>
              <strong className="font-semibold">{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          className="flex-1 border rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button 
          className="bg-blue-600 text-white rounded-r-lg p-3 transition-transform duration-300 hover:bg-blue-700" 
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
      <footer className="mt-8 text-center text-gray-500">
        <p>Powered by AI. Your privacy is our priority.</p>
      </footer>
    </div>
  );
}

export default AgentsOpus;
