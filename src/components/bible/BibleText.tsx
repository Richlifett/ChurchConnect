import React, { useState, useEffect } from 'react';
import { Bookmark, Share2, Copy, Highlighter as Highlight, Loader, Monitor } from 'lucide-react';
import clsx from 'clsx';
import { bibleApi, BiblePassage } from '../../services/bibleApi';
import { useApp } from '../../context/AppContext';

interface BibleTextProps {
  translation: string;
  book: string;
  chapter: number;
  searchTerm: string;
  isSharedView: boolean;
}

export function BibleText({ translation, book, chapter, searchTerm, isSharedView }: BibleTextProps) {
  const { state, dispatch } = useApp();
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<number[]>([16]);
  const [passage, setPassage] = useState<BiblePassage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPassage = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await bibleApi.getPassage(book, chapter, translation);
        setPassage(data);
      } catch (err) {
        setError('Failed to load Bible passage');
        console.error('Error fetching passage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPassage();
  }, [book, chapter, translation]);

  const handleVerseClick = (verse: number) => {
    setSelectedVerse(selectedVerse === verse ? null : verse);
  };

  const handleBookmark = (verse: number) => {
    setBookmarkedVerses(prev =>
      prev.includes(verse)
        ? prev.filter(v => v !== verse)
        : [...prev, verse]
    );
  };

  const handleCopyVerse = async (verseData: any) => {
    const text = `${verseData.text} - ${book} ${chapter}:${verseData.verse} (${translation})`;
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy verse:', err);
    }
  };

  const handleShareToVideo = (verseData: any) => {
    if (!state.isInMeeting) {
      alert('You must be in a meeting to share verses to video');
      return;
    }

    const sharedVerse = {
      id: Date.now().toString(),
      reference: `${book} ${chapter}:${verseData.verse}`,
      text: verseData.text,
      translation: translation.toUpperCase(),
      sharedBy: 'You',
      timestamp: new Date()
    };

    dispatch({ type: 'SHARE_VERSE', payload: sharedVerse });
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading Bible passage...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-primary-600 hover:text-primary-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!passage || !passage.verses.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No verses found for this passage.
      </div>
    );
  }

  return (
    <div className="p-6">
      {isSharedView && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">
              Sharing with meeting participants
            </span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {passage.reference} ({passage.translation_name || translation.toUpperCase()})
        </h3>
        {passage.translation_note && (
          <p className="text-sm text-gray-600">{passage.translation_note}</p>
        )}
      </div>

      <div className="space-y-4">
        {passage.verses.map((verseData) => (
          <div
            key={verseData.verse}
            className={clsx(
              'group relative p-4 rounded-lg cursor-pointer transition-all duration-200',
              selectedVerse === verseData.verse
                ? 'bg-primary-50 border border-primary-200'
                : 'hover:bg-gray-50',
              bookmarkedVerses.includes(verseData.verse) && 'bg-gold-50 border-l-4 border-gold-400'
            )}
            onClick={() => handleVerseClick(verseData.verse)}
          >
            <div className="flex items-start space-x-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-700 text-xs font-bold rounded-full flex-shrink-0 mt-1">
                {verseData.verse}
              </span>
              <p className="text-gray-800 leading-relaxed flex-1 text-lg">
                {highlightText(verseData.text)}
              </p>
            </div>

            {selectedVerse === verseData.verse && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark(verseData.verse);
                  }}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    bookmarkedVerses.includes(verseData.verse)
                      ? 'bg-gold-100 text-gold-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                  title="Bookmark verse"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                
                {state.isInMeeting && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareToVideo(verseData);
                    }}
                    className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                    title="Share to video feed"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Share verse"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyVerse(verseData);
                  }}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy verse"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Highlight"
                >
                  <Highlight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}