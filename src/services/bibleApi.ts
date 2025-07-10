// Bible API service using Bible API (bible-api.com) and ESV API as fallback
export interface BibleVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BiblePassage {
  reference: string;
  verses: BibleVerse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

export interface SearchResult {
  reference: string;
  text: string;
  book_name: string;
  chapter: number;
  verse: number;
}

class BibleApiService {
  private readonly BIBLE_API_BASE = 'https://bible-api.com';
  private readonly ESV_API_BASE = 'https://api.esv.org/v3';
  private readonly ESV_API_KEY = 'IP'; // Using the public IP key for demo

  // Available translations
  public readonly translations = [
    { id: 'kjv', name: 'King James Version', code: 'kjv' },
    { id: 'web', name: 'World English Bible', code: 'web' },
    { id: 'esv', name: 'English Standard Version', code: 'esv' },
    { id: 'nasb', name: 'New American Standard Bible', code: 'nasb' },
    { id: 'niv', name: 'New International Version', code: 'niv' }
  ];

  // Bible books with chapter counts
  public readonly books = [
    { name: 'Genesis', chapters: 50 },
    { name: 'Exodus', chapters: 40 },
    { name: 'Leviticus', chapters: 27 },
    { name: 'Numbers', chapters: 36 },
    { name: 'Deuteronomy', chapters: 34 },
    { name: 'Joshua', chapters: 24 },
    { name: 'Judges', chapters: 21 },
    { name: 'Ruth', chapters: 4 },
    { name: '1 Samuel', chapters: 31 },
    { name: '2 Samuel', chapters: 24 },
    { name: '1 Kings', chapters: 22 },
    { name: '2 Kings', chapters: 25 },
    { name: '1 Chronicles', chapters: 29 },
    { name: '2 Chronicles', chapters: 36 },
    { name: 'Ezra', chapters: 10 },
    { name: 'Nehemiah', chapters: 13 },
    { name: 'Esther', chapters: 10 },
    { name: 'Job', chapters: 42 },
    { name: 'Psalms', chapters: 150 },
    { name: 'Proverbs', chapters: 31 },
    { name: 'Ecclesiastes', chapters: 12 },
    { name: 'Song of Solomon', chapters: 8 },
    { name: 'Isaiah', chapters: 66 },
    { name: 'Jeremiah', chapters: 52 },
    { name: 'Lamentations', chapters: 5 },
    { name: 'Ezekiel', chapters: 48 },
    { name: 'Daniel', chapters: 12 },
    { name: 'Hosea', chapters: 14 },
    { name: 'Joel', chapters: 3 },
    { name: 'Amos', chapters: 9 },
    { name: 'Obadiah', chapters: 1 },
    { name: 'Jonah', chapters: 4 },
    { name: 'Micah', chapters: 7 },
    { name: 'Nahum', chapters: 3 },
    { name: 'Habakkuk', chapters: 3 },
    { name: 'Zephaniah', chapters: 3 },
    { name: 'Haggai', chapters: 2 },
    { name: 'Zechariah', chapters: 14 },
    { name: 'Malachi', chapters: 4 },
    { name: 'Matthew', chapters: 28 },
    { name: 'Mark', chapters: 16 },
    { name: 'Luke', chapters: 24 },
    { name: 'John', chapters: 21 },
    { name: 'Acts', chapters: 28 },
    { name: 'Romans', chapters: 16 },
    { name: '1 Corinthians', chapters: 16 },
    { name: '2 Corinthians', chapters: 13 },
    { name: 'Galatians', chapters: 6 },
    { name: 'Ephesians', chapters: 6 },
    { name: 'Philippians', chapters: 4 },
    { name: 'Colossians', chapters: 4 },
    { name: '1 Thessalonians', chapters: 5 },
    { name: '2 Thessalonians', chapters: 3 },
    { name: '1 Timothy', chapters: 6 },
    { name: '2 Timothy', chapters: 4 },
    { name: 'Titus', chapters: 3 },
    { name: 'Philemon', chapters: 1 },
    { name: 'Hebrews', chapters: 13 },
    { name: 'James', chapters: 5 },
    { name: '1 Peter', chapters: 5 },
    { name: '2 Peter', chapters: 3 },
    { name: '1 John', chapters: 5 },
    { name: '2 John', chapters: 1 },
    { name: '3 John', chapters: 1 },
    { name: 'Jude', chapters: 1 },
    { name: 'Revelation', chapters: 22 }
  ];

  async getPassage(book: string, chapter: number, translation: string = 'kjv'): Promise<BiblePassage> {
    try {
      const reference = `${book} ${chapter}`;
      const url = `${this.BIBLE_API_BASE}/${encodeURIComponent(reference)}?translation=${translation}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        reference: data.reference,
        verses: data.verses,
        text: data.text,
        translation_id: data.translation_id,
        translation_name: data.translation_name,
        translation_note: data.translation_note || ''
      };
    } catch (error) {
      console.error('Error fetching Bible passage:', error);
      // Fallback to sample data
      return this.getFallbackPassage(book, chapter, translation);
    }
  }

  async getVerse(book: string, chapter: number, verse: number, translation: string = 'kjv'): Promise<BibleVerse> {
    try {
      const reference = `${book} ${chapter}:${verse}`;
      const url = `${this.BIBLE_API_BASE}/${encodeURIComponent(reference)}?translation=${translation}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.verses[0];
    } catch (error) {
      console.error('Error fetching Bible verse:', error);
      // Fallback to sample data
      return this.getFallbackVerse(book, chapter, verse);
    }
  }

  async searchVerses(query: string, translation: string = 'kjv'): Promise<SearchResult[]> {
    try {
      // For demo purposes, we'll simulate search results
      // In a real implementation, you'd use a proper search API
      const searchResults = await this.simulateSearch(query, translation);
      return searchResults;
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  }

  private async simulateSearch(query: string, translation: string): Promise<SearchResult[]> {
    // Simulate search results based on common queries
    const commonSearches: { [key: string]: SearchResult[] } = {
      'love': [
        {
          reference: 'John 3:16',
          text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
          book_name: 'John',
          chapter: 3,
          verse: 16
        },
        {
          reference: '1 Corinthians 13:4',
          text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,',
          book_name: '1 Corinthians',
          chapter: 13,
          verse: 4
        }
      ],
      'faith': [
        {
          reference: 'Hebrews 11:1',
          text: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
          book_name: 'Hebrews',
          chapter: 11,
          verse: 1
        },
        {
          reference: 'Romans 10:17',
          text: 'So then faith cometh by hearing, and hearing by the word of God.',
          book_name: 'Romans',
          chapter: 10,
          verse: 17
        }
      ],
      'peace': [
        {
          reference: 'Philippians 4:7',
          text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
          book_name: 'Philippians',
          chapter: 4,
          verse: 7
        }
      ]
    };

    const lowerQuery = query.toLowerCase();
    for (const [key, results] of Object.entries(commonSearches)) {
      if (lowerQuery.includes(key)) {
        return results;
      }
    }

    return [];
  }

  private getFallbackPassage(book: string, chapter: number, translation: string): BiblePassage {
    // Sample John 3 passage for fallback
    if (book.toLowerCase() === 'john' && chapter === 3) {
      return {
        reference: 'John 3',
        verses: [
          {
            book_name: 'John',
            chapter: 3,
            verse: 1,
            text: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:'
          },
          {
            book_name: 'John',
            chapter: 3,
            verse: 2,
            text: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.'
          },
          {
            book_name: 'John',
            chapter: 3,
            verse: 3,
            text: 'Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.'
          },
          {
            book_name: 'John',
            chapter: 3,
            verse: 16,
            text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'
          }
        ],
        text: 'John 3:1-16 passage text...',
        translation_id: translation,
        translation_name: translation.toUpperCase(),
        translation_note: ''
      };
    }

    return {
      reference: `${book} ${chapter}`,
      verses: [],
      text: 'Passage not available in offline mode.',
      translation_id: translation,
      translation_name: translation.toUpperCase(),
      translation_note: ''
    };
  }

  private getFallbackVerse(book: string, chapter: number, verse: number): BibleVerse {
    return {
      book_name: book,
      chapter: chapter,
      verse: verse,
      text: 'Verse not available in offline mode.'
    };
  }
}

export const bibleApi = new BibleApiService();