import React from 'react';
import { Bookmark, Trash2 } from 'lucide-react';

const sampleBookmarks = [
  {
    id: 1,
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his only Son...',
    date: new Date(2024, 11, 10)
  },
  {
    id: 2,
    reference: 'Philippians 4:13',
    text: 'I can do all things through him who strengthens me.',
    date: new Date(2024, 11, 8)
  },
  {
    id: 3,
    reference: 'Jeremiah 29:11',
    text: 'For I know the plans I have for you, declares the Lord...',
    date: new Date(2024, 11, 5)
  }
];

export function BookmarksList() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-5 h-5 text-gold-500" />
          <h3 className="font-semibold text-gray-900">Bookmarks</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sampleBookmarks.map((bookmark) => (
          <div key={bookmark.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-primary-700 mb-1">
                  {bookmark.reference}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {bookmark.text}
                </p>
                <div className="text-xs text-gray-400">
                  {bookmark.date.toLocaleDateString()}
                </div>
              </div>
              <button className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}