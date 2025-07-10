import React from 'react';
import { Search } from 'lucide-react';

interface BibleSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function BibleSearch({ searchTerm, setSearchTerm }: BibleSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search verses, keywords, or topics..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );
}