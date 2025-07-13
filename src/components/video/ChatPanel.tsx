import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useApp, ChatMessage } from '../../context/AppContext';
import { chatService } from '../../services/chat';

interface ChatPanelProps {
  onClose: () => void;
  recipient?: string;
}

export function ChatPanel({ onClose, recipient }: ChatPanelProps) {
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, recipient]);

  const send = () => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      recipient,
      text: text.trim(),
      timestamp: new Date(),
      recipientId: null
    };
    chatService.sendMessage(msg);
    dispatch({ type: 'SEND_MESSAGE', payload: msg });
    setText('');
  };

  const filteredMessages = recipient
    ? state.messages.filter(
        (m) =>
          (m.sender === 'You' && m.recipient === recipient) ||
          (m.sender === recipient && m.recipient === 'You')
      )
    : state.messages;

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">
            {recipient ? `Chat with ${recipient}` : 'Chat'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="Close chat"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-700/20">
        {filteredMessages.map((m) => (
          <div key={m.id} className="text-sm text-white">
            <div className="text-xs text-gray-400 mb-1">
              {m.sender} - {m.timestamp.toLocaleTimeString()}
            </div>
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-gray-700 flex items-center space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          className="flex-1 bg-gray-600 text-white rounded p-2 text-sm focus:outline-none"
          placeholder="Type a message"
        />
        <button
          onClick={send}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
