import React, { useState } from 'react';
import { Search, Book, Bookmark, Share2, ChevronDown, Eye, EyeOff, Monitor } from 'lucide-react';
import { BibleSearch } from './bible/BibleSearch';
import { BibleText } from './bible/BibleText';
import { BookmarksList } from './bible/BookmarksList';
import { bibleApi } from '../services/bibleApi';
import { useApp } from '../context/AppContext';

export function BibleViewer() {
  const { state } = useApp();
  const [selectedTranslation, setSelectedTranslation] = useState('kjv');
  const [selectedBook, setSelectedBook] = useState('John');
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);

  const selectedBookInfo = bibleApi.books.find(book => book.name === selectedBook);
  const maxChapters = selectedBookInfo?.chapters || 1;

  return (
    <div className="h-full bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Book className="w-6 h-6" />
            <h2 className="text-xl font-bold">Bible Study</h2>
          </div>
          <div className="flex items-center space-x-2">
            {state.isInMeeting && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-lg">
                <Monitor className="w-4 h-4" />
                <span className="text-sm">
                  {state.isVerseSharing ? 'Verse Shared' : 'Ready to Share'}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsSharedView(!isSharedView)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title={isSharedView ? 'Stop sharing' : 'Share with meeting'}
            >
              {isSharedView ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <select
            value={selectedTranslation}
            onChange={(e) => setSelectedTranslation(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm"
          >
            {bibleApi.translations.map(translation => (
              <option key={translation.id} value={translation.id} className="text-gray-900">
                {translation.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedBook}
            onChange={(e) => {
              setSelectedBook(e.target.value);
              setSelectedChapter(1); // Reset to chapter 1 when book changes
            }}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm"
          >
            {bibleApi.books.map(book => (
              <option key={book.name} value={book.name} className="text-gray-900">
                {book.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white backdrop-blur-sm"
          >
            {Array.from({ length: maxChapters }, (_, i) => i + 1).map(chapter => (
              <option key={chapter} value={chapter} className="text-gray-900">
                Chapter {chapter}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <BibleSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>

          {/* Bible Text */}
          <div className="flex-1 overflow-auto">
            <BibleText
              translation={selectedTranslation}
              book={selectedBook}
              chapter={selectedChapter}
              searchTerm={searchTerm}
              isSharedView={isSharedView}
            />
          </div>
        </div>

        {/* Bookmarks Panel */}
        {showBookmarks && (
          <div className="w-80 border-l border-gray-200">
            <BookmarksList />
          </div>
        )}
      </div>
    </div>
  );
}