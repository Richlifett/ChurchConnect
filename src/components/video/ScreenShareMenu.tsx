import React, { useState } from 'react';
import { Monitor, MonitorSpeaker, Smartphone, Book, X } from 'lucide-react';

interface ScreenShareMenuProps {
  onClose: () => void;
  onShareScreen: () => void;
  onShareWindow: () => void;
  onShareTab: () => void;
  onShareVerse: () => void;
}

export function ScreenShareMenu({ onClose, onShareScreen, onShareWindow, onShareTab, onShareVerse }: ScreenShareMenuProps) {
  const shareOptions = [
    {
      id: 'screen',
      title: 'Entire Screen',
      description: 'Share your entire screen',
      icon: Monitor,
      onClick: onShareScreen
    },
    {
      id: 'window',
      title: 'Application Window',
      description: 'Share a specific application',
      icon: MonitorSpeaker,
      onClick: onShareWindow
    },
    {
      id: 'tab',
      title: 'Browser Tab',
      description: 'Share a browser tab',
      icon: Smartphone,
      onClick: onShareTab
    },
    {
      id: 'verse',
      title: 'Share Bible Verse',
      description: 'Display a Bible verse to participants',
      icon: Book,
      onClick: onShareVerse
    }
  ];

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 min-w-80 z-40">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Share Content</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-2">
        {shareOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={option.onClick}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`p-2 rounded-lg ${
                option.id === 'verse' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.title}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}