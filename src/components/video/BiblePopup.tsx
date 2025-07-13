import React, { useState } from 'react';
import { X, Book, Search, Monitor } from 'lucide-react';
import { bibleApi, BiblePassage, BibleVerse } from '../../services/bibleApi';
import { useApp } from '../../context/AppContext';
import clsx from 'clsx';

interface BiblePopupProps {
  onClose: () => void;
  isEmbedded?: boolean;
}

export function BiblePopup({ onClose, isEmbedded = false }: BiblePopupProps) {
  const { dispatch } = useApp();
  const [selectedTranslation, setSelectedTranslation] = useState('kjv');
  const [selectedBook, setSelectedBook] = useState('John');
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [passage, setPassage] = useState<BiblePassage | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  React.useEffect(() => {
    const fetchPassage = async () => {
      setLoading(true);
      try {
        const data = await bibleApi.getPassage(selectedBook, selectedChapter, selectedTranslation);
        setPassage(data);
      } catch (err) {
        console.error('Error fetching passage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPassage();
  }, [selectedBook, selectedChapter, selectedTranslation]);

  const selectedBookInfo = bibleApi.books.find(book => book.name === selectedBook);
  const maxChapters = selectedBookInfo?.chapters || 1;

  const handleShareVerse = (verseData: BibleVerse) => {
    const sharedVerse = {
      id: Date.now().toString(),
      reference: `${selectedBook} ${selectedChapter}:${verseData.verse}`,
      text: verseData.text,
      translation: selectedTranslation.toUpperCase(),
      sharedBy: 'You',
      timestamp: new Date()
    };

    dispatch({ type: 'SHARE_VERSE', payload: sharedVerse });
    
    // Always close the Bible popup after sharing
    onClose();
  };

  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const containerClasses = isEmbedded 
    ? "h-full flex flex-col bg-white"
    : "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4";

  const contentClasses = isEmbedded
    ? "h-full flex flex-col"
    : "bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Book className="w-5 h-5" />
              <h2 className="text-lg font-bold">
                {isEmbedded ? 'Bible Verses' : 'Share Bible Verse'}
              </h2>
            </div>
            {!isEmbedded && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-3 gap-2">
            <select
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
              className="bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-white backdrop-blur-sm text-sm"
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
                setSelectedChapter(1);
              }}
              className="bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-white backdrop-blur-sm text-sm"
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
              className="bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-white backdrop-blur-sm text-sm"
            >
              {Array.from({ length: maxChapters }, (_, i) => i + 1).map(chapter => (
                <option key={chapter} value={chapter} className="text-gray-900">
                  Ch. {chapter}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search verses..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Bible Text */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-600 text-sm">Loading Bible passage...</div>
            </div>
          ) : passage && passage.verses.length > 0 ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {passage.reference} ({passage.translation_name || selectedTranslation.toUpperCase()})
                </h3>
              </div>

              <div className="space-y-3">
                {passage.verses.map((verseData) => (
                  <div
                    key={verseData.verse}
                    className={clsx(
                      'group relative p-3 rounded-lg cursor-pointer transition-all duration-200 border text-sm',
                      selectedVerse === verseData.verse
                        ? 'bg-primary-50 border-primary-200'
                        : 'hover:bg-gray-50 border-gray-200'
                    )}
                    onClick={() => setSelectedVerse(selectedVerse === verseData.verse ? null : verseData.verse)}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full flex-shrink-0 mt-0.5">
                        {verseData.verse}
                      </span>
                      <p className="text-gray-800 leading-relaxed flex-1">
                        {highlightText(verseData.text)}
                      </p>
                    </div>

                    {selectedVerse === verseData.verse && (
                      <div className="mt-2 pt-2 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareVerse(verseData);
                          }}
                          className="flex items-center space-x-1 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium"
                        >
                          <Monitor className="w-3 h-3" />
                          <span>Share to Meeting</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <div className="text-sm">No verses found for this passage.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}