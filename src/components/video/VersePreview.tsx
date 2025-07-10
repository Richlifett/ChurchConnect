import React, { useState } from 'react';
import { X, Book, User, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { format } from 'date-fns';

interface SharedVerse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  sharedBy: string;
  timestamp: Date;
}

interface VersePreviewProps {
  verse: SharedVerse;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function VersePreview({ verse, onClose, isMinimized, onToggleMinimize }: VersePreviewProps) {
  if (isMinimized) {
    return (
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Book className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Sharing: {verse.reference}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={onToggleMinimize}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Expand preview"
            >
              <Maximize2 className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Stop sharing"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-4 bg-gradient-to-br from-primary-900/95 to-purple-900/95 backdrop-blur-sm rounded-2xl flex items-center justify-center p-8 z-20">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
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
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleMinimize}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Minimize preview"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Stop sharing"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Verse Content */}
        <div className="p-8">
          <div className="mb-4 text-center">
            <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              Participants are seeing this verse
            </div>
          </div>
          
          <blockquote className="text-2xl md:text-3xl leading-relaxed text-gray-800 font-serif text-center mb-8">
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
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-sm text-gray-600">
            This is what all meeting participants are currently seeing
          </p>
        </div>
      </div>
    </div>
  );
}