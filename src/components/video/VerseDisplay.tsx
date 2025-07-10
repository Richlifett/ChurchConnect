import React from 'react';
import { X, Book, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SharedVerse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  sharedBy: string;
  timestamp: Date;
}

interface VerseDisplayProps {
  verse: SharedVerse;
  onClose: () => void;
}

export function VerseDisplay({ verse, onClose }: VerseDisplayProps) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-primary-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4 md:p-8 overflow-auto">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Book className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">{verse.reference}</h3>
                <p className="text-primary-100 text-sm">{verse.translation}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close verse display"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verse Content */}
        <div className="p-6 md:p-8">
          <blockquote className="text-lg md:text-xl lg:text-2xl xl:text-3xl leading-relaxed text-gray-800 font-serif text-center mb-6 md:mb-8 px-2 md:px-4">
            "{verse.text}"
          </blockquote>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Shared by {verse.sharedBy}</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{format(verse.timestamp, 'HH:mm')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 md:px-8 py-4 text-center">
          <p className="text-sm text-gray-600">
            This verse is being shared with all meeting participants • Click the X to close
          </p>
        </div>
      </div>
    </div>
  );
}