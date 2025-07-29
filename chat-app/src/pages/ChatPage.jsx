import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchMessages();

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('http://localhost:3000/chat');
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const data = {
      senderId: 'user-1',
      receiverId: 'user-2',
      message: input.trim(),
    };

    try {
      const res = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setInput('');
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  // Helper to format date/time nicely
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Current user id (for demo)
  const currentUserId = 'user-2';

  return (
    <div className="flex flex-col max-w-xl mx-auto h-screen p-4 bg-gray-50">
      <header className="sticky top-0 bg-white py-4 border-b border-gray-300 text-center text-xl font-semibold shadow-sm z-10">
        Chat Room
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg shadow ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      <form
        onSubmit={handleSubmit}
        className="flex items-center border-t border-gray-300 bg-white p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className={`ml-2 px-4 py-2 rounded-r text-white ${
            input.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
