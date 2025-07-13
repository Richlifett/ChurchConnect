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

  private cache: Record<string, BiblePassage | BibleVerse> = {};

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('bibleApiCache');
      if (saved) {
        try {
          this.cache = JSON.parse(saved);
        } catch {
          this.cache = {};
        }
      }
    }
  }

  private saveCache() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('bibleApiCache', JSON.stringify(this.cache));
      } catch (error) {
        console.warn('Failed to persist Bible API cache:', error);
        // Clear cache if it's too large
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          this.cache = {};
          try {
            localStorage.removeItem('bibleApiCache');
          } catch (removeError) {
            console.warn('Failed to clear Bible API cache:', removeError);
          }
        }
      }
    }
  }

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
    const key = `passage:${book}:${chapter}:${translation}`;
    const cached = this.cache[key] as BiblePassage | undefined;
    if (cached) {
      return cached;
    }

    try {
      // Format the reference properly for the API
      const reference = `${book.replace(/\s+/g, '')} ${chapter}`;
      const encodedReference = encodeURIComponent(reference);
      const url = `${this.BIBLE_API_BASE}/${encodedReference}`;
      
      // Add translation parameter only for supported translations
      const supportedTranslations = ['kjv', 'web'];
      const finalUrl = supportedTranslations.includes(translation.toLowerCase()) 
        ? `${url}?translation=${translation}`
        : url;

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn(`Bible API returned ${response.status} for ${reference}, using fallback`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate the response structure
      if (!data || !data.verses || !Array.isArray(data.verses)) {
        throw new Error('Invalid response format from Bible API');
      }

      const passage: BiblePassage = {
        reference: data.reference || `${book} ${chapter}`,
        verses: data.verses,
        text: data.text || '',
        translation_id: data.translation_id || translation,
        translation_name: data.translation_name || translation.toUpperCase(),
        translation_note: data.translation_note || ''
      };

      this.cache[key] = passage;
      this.saveCache();

      return passage;
    } catch (error) {
      console.warn('Bible API unavailable, using offline content:', error instanceof Error ? error.message : 'Unknown error');
      const fallback = this.getFallbackPassage(book, chapter, translation);
      this.cache[key] = fallback;
      return fallback;
    }
  }

  async getVerse(book: string, chapter: number, verse: number, translation: string = 'kjv'): Promise<BibleVerse> {
    const key = `verse:${book}:${chapter}:${verse}:${translation}`;
    const cached = this.cache[key] as BibleVerse | undefined;
    if (cached) {
      return cached;
    }

    try {
      const reference = `${book} ${chapter}:${verse}`;
      const url = `${this.BIBLE_API_BASE}/${encodeURIComponent(reference)}?translation=${translation}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const verseData: BibleVerse = data.verses[0];

      this.cache[key] = verseData;
      this.saveCache();

      return verseData;
    } catch (error) {
      console.error('Error fetching Bible verse:', error);
      const fallback = this.getFallbackVerse(book, chapter, verse);
      this.cache[key] = fallback;
      return fallback;
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
    const bookLower = book.toLowerCase().replace(/\s+/g, '');
    
    // Expanded fallback content for common passages
    if (bookLower === 'john' && chapter === 3) {
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
          },
          {
            book_name: 'John',
            chapter: 3,
            verse: 17,
            text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.'
          }
        ],
        text: 'John 3:1-17 - The conversation with Nicodemus about being born again and God\'s love for the world.',
        translation_id: translation,
        translation_name: translation.toUpperCase(),
        translation_note: 'Offline content'
      };
    }
    
    if (bookLower === 'psalms' && chapter === 23) {
      return {
        reference: 'Psalms 23',
        verses: [
          {
            book_name: 'Psalms',
            chapter: 23,
            verse: 1,
            text: 'The LORD is my shepherd; I shall not want.'
          },
          {
            book_name: 'Psalms',
            chapter: 23,
            verse: 2,
            text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.'
          },
          {
            book_name: 'Psalms',
            chapter: 23,
            verse: 3,
            text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.'
          },
          {
            book_name: 'Psalms',
            chapter: 23,
            verse: 4,
            text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.'
          },
          {
            book_name: 'Psalms',
            chapter: 23,
            verse: 5,
            text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.'
          },
          {
            book_name: 'Psalms',
            chapter: 23,
            verse: 6,
            text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.'
          }
        ],
        text: 'Psalms 23 - The Lord is my shepherd psalm.',
        translation_id: translation,
        translation_name: translation.toUpperCase(),
        translation_note: 'Offline content'
      };
    }
    
    if (bookLower === 'matthew' && chapter === 5) {
      return {
        reference: 'Matthew 5',
        verses: [
          {
            book_name: 'Matthew',
            chapter: 5,
            verse: 3,
            text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.'
          },
          {
            book_name: 'Matthew',
            chapter: 5,
            verse: 4,
            text: 'Blessed are they that mourn: for they shall be comforted.'
          },
          {
            book_name: 'Matthew',
            chapter: 5,
            verse: 14,
            text: 'Ye are the light of the world. A city that is set on an hill cannot be hid.'
          },
          {
            book_name: 'Matthew',
            chapter: 5,
            verse: 16,
            text: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.'
          }
        ],
        text: 'Matthew 5 - The Beatitudes and teachings from the Sermon on the Mount.',
        translation_id: translation,
        translation_name: translation.toUpperCase(),
        translation_note: 'Offline content'
      };
    }

    // Generic fallback for any book/chapter
    return {
      reference: `${book} ${chapter}`,
      verses: [
        {
          book_name: book,
          chapter: chapter,
          verse: 1,
          text: `${book} ${chapter} content is not available in offline mode. Please check your internet connection and try again.`
        }
      ],
      text: `${book} ${chapter} - Content not available offline.`,
      translation_id: translation,
      translation_name: translation.toUpperCase(),
      translation_note: 'Offline mode - limited content available'
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