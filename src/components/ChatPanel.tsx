import React, { useState, useRef } from 'react';
import { Send, Smile, Paperclip, Dribbble as Bible, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { bibleApi } from '../services/bibleApi';

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'verse' | 'system';
  verseReference?: string;
}

const sampleMessages: Message[] = [
  {
    id: '1',
    author: 'Pastor Mike',
    content: 'Welcome everyone to our Bible study! Let\'s begin with prayer.',
    timestamp: new Date(2024, 11, 15, 19, 0),
    type: 'text'
  },
  {
    id: '2',
    author: 'Sarah Johnson',
    content: 'Thank you for hosting this study, Pastor Mike!',
    timestamp: new Date(2024, 11, 15, 19, 2),
    type: 'text'
  },
  {
    id: '3',
    author: 'Pastor Mike',
    content: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    timestamp: new Date(2024, 11, 15, 19, 5),
    type: 'verse',
    verseReference: 'John 3:16 (ESV)'
  },
  {
    id: '4',
    author: 'System',
    content: 'David Wilson joined the meeting',
    timestamp: new Date(2024, 11, 15, 19, 7),
    type: 'system'
  }
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'private'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      author: 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleShareVerse = async () => {
    try {
      const verse = await bibleApi.getVerse('John', 3, 16);
      const verseMessage: Message = {
        id: Date.now().toString(),
        author: 'You',
        content: verse.text,
        timestamp: new Date(),
        type: 'verse',
        verseReference: `${verse.book_name} ${verse.chapter}:${verse.verse} (KJV)`
      };
      setMessages(prev => [...prev, verseMessage]);
    } catch (err) {
      console.error('Failed to share verse:', err);
    } finally {
      textareaRef.current?.focus();
    }
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileMessage: Message = {
        id: Date.now().toString(),
        author: 'You',
        content: `Attached file: ${file.name}`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, fileMessage]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    textareaRef.current?.focus();
  };

  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  const handleAddEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const MessageComponent = ({ message }: { message: Message }) => {
    if (message.type === 'system') {
      return (
        <div className="flex justify-center my-2">
          <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
            <Clock className="w-3 h-3 inline mr-1" />
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 animate-slide-up">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {message.author.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-900">{message.author}</span>
              <span className="text-xs text-gray-500">
                {format(message.timestamp, 'HH:mm')}
              </span>
            </div>
            <div className={`p-3 rounded-lg ${
              message.type === 'verse'
                ? 'bg-gradient-to-r from-gold-50 to-yellow-50 border border-gold-200'
                : 'bg-gray-50'
            }`}>
              {message.type === 'verse' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Bible className="w-4 h-4 text-gold-600" />
                  <span className="text-sm font-medium text-gold-700">
                    {message.verseReference}
                  </span>
                </div>
              )}
              <p className="text-gray-800 leading-relaxed">{message.content}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Chat & Discussion</h2>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span className="text-sm">4 participants</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Everyone
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'private'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Private Messages
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(message => (
          <MessageComponent key={message.id} message={message} />
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2 relative">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={2}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button onClick={handleShareVerse} className="p-2 text-gray-500 hover:text-primary-600 transition-colors">
              <Bible className="w-5 h-5" title="Share verse" />
            </button>
            <button onClick={handleAttachFile} className="p-2 text-gray-500 hover:text-primary-600 transition-colors">
              <Paperclip className="w-5 h-5" title="Attach file" />
            </button>
            <button onClick={handleToggleEmojiPicker} className="p-2 text-gray-500 hover:text-primary-600 transition-colors">
              <Smile className="w-5 h-5" title="Add emoji" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {showEmojiPicker && (
            <div className="absolute bottom-14 right-2 bg-white border border-gray-200 rounded-lg shadow p-2 grid grid-cols-4 gap-1">
              {['😀','😍','🙏','🎉','😢','👍','😇','❤️'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleAddEmoji(emoji)}
                  className="text-lg hover:bg-gray-100 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}