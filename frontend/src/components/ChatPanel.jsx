import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';

function ChatPanel({ messages, onSendMessage }) {
  const [inputMessage, setInputMessage] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage({
        message: inputMessage,
        sender: 'Bạn',
        timestamp: new Date().toISOString(),
      });
      setInputMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Trò Chuyện</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {messages.length} tin nhắn
        </p>
      </div>

      {/* Messages list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Chưa có tin nhắn nào</p>
            <p className="text-xs mt-1">Gửi tin nhắn đầu tiên của bạn</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender === 'Bạn';
            return (
              <div
                key={index}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-3 py-2 ${
                    isOwn
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1 text-indigo-300">
                      {message.sender}
                    </p>
                  )}
                  <p className="text-sm break-words">{message.message}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPanel;
