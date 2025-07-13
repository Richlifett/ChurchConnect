interface ParsedVerse {
  number: number;
  text: string;
}

interface ParsedChapter {
  number: number;
  verses: ParsedVerse[];
}

interface ParsedBook {
  name: string;
  chapters: number;
  chapterData: Map<number, ParsedChapter>;
}

interface ParsedBible {
  translation: string;
  name: string;
  books: Map<string, ParsedBook>;
}

class XMLBibleParser {
  private cache: Map<string, ParsedBible> = new Map();
  private loadingPromises: Map<string, Promise<ParsedBible>> = new Map();

  async loadTranslation(translation: string): Promise<ParsedBible> {
    // Return cached version if available
    if (this.cache.has(translation)) {
      return this.cache.get(translation)!;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(translation)) {
      return this.loadingPromises.get(translation)!;
    }

    // Start loading
    const loadingPromise = this.fetchAndParseBible(translation);
    this.loadingPromises.set(translation, loadingPromise);

    try {
      const result = await loadingPromise;
      this.cache.set(translation, result);
      return result;
    } finally {
      this.loadingPromises.delete(translation);
    }
  }

  private async fetchAndParseBible(translation: string): Promise<ParsedBible> {
    try {
      const response = await fetch(`/bibles/${translation}.xml`);
      if (!response.ok) {
        throw new Error(`Failed to load ${translation}: ${response.status}`);
      }

      const xmlText = await response.text();
      return this.parseXML(xmlText);
    } catch (error) {
      console.warn(`Failed to load XML for ${translation}:`, error);
      throw error;
    }
  }

  private parseXML(xmlText: string): ParsedBible {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parsing failed');
    }

    const bibleElement = doc.querySelector('bible');
    if (!bibleElement) {
      throw new Error('Invalid Bible XML format');
    }

    const translation = bibleElement.getAttribute('translation') || 'unknown';
    const name = bibleElement.getAttribute('name') || 'Unknown Translation';

    const books = new Map<string, ParsedBook>();

    // Parse books
    const bookElements = bibleElement.querySelectorAll('book');
    for (const bookElement of bookElements) {
      const bookName = bookElement.getAttribute('name');
      const chaptersCount = parseInt(bookElement.getAttribute('chapters') || '1');
      
      if (!bookName) continue;

      const chapterData = new Map<number, ParsedChapter>();

      // Parse chapters
      const chapterElements = bookElement.querySelectorAll('chapter');
      for (const chapterElement of chapterElements) {
        const chapterNumber = parseInt(chapterElement.getAttribute('number') || '1');
        const verses: ParsedVerse[] = [];

        // Parse verses
        const verseElements = chapterElement.querySelectorAll('verse');
        for (const verseElement of verseElements) {
          const verseNumber = parseInt(verseElement.getAttribute('number') || '1');
          const text = verseElement.textContent?.trim() || '';
          
          verses.push({
            number: verseNumber,
            text
          });
        }

        chapterData.set(chapterNumber, {
          number: chapterNumber,
          verses
        });
      }

      books.set(bookName, {
        name: bookName,
        chapters: chaptersCount,
        chapterData
      });
    }

    return {
      translation,
      name,
      books
    };
  }

  async getPassage(translation: string, book: string, chapter: number): Promise<{
    reference: string;
    verses: Array<{ book_name: string; chapter: number; verse: number; text: string }>;
    text: string;
    translation_id: string;
    translation_name: string;
    translation_note: string;
  }> {
    try {
      const bible = await this.loadTranslation(translation);
      const bookData = bible.books.get(book);
      
      if (!bookData) {
        throw new Error(`Book ${book} not found`);
      }

      const chapterData = bookData.chapterData.get(chapter);
      if (!chapterData) {
        throw new Error(`Chapter ${chapter} not found in ${book}`);
      }

      const verses = chapterData.verses.map(verse => ({
        book_name: book,
        chapter: chapter,
        verse: verse.number,
        text: verse.text
      }));

      const text = verses.map(v => `${v.verse}. ${v.text}`).join(' ');

      return {
        reference: `${book} ${chapter}`,
        verses,
        text,
        translation_id: bible.translation,
        translation_name: bible.name,
        translation_note: 'From XML Bible files'
      };
    } catch (error) {
      console.error('Error parsing XML Bible:', error);
      throw error;
    }
  }

  async getVerse(translation: string, book: string, chapter: number, verse: number): Promise<{
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }> {
    try {
      const bible = await this.loadTranslation(translation);
      const bookData = bible.books.get(book);
      
      if (!bookData) {
        throw new Error(`Book ${book} not found`);
      }

      const chapterData = bookData.chapterData.get(chapter);
      if (!chapterData) {
        throw new Error(`Chapter ${chapter} not found in ${book}`);
      }

      const verseData = chapterData.verses.find(v => v.number === verse);
      if (!verseData) {
        throw new Error(`Verse ${verse} not found in ${book} ${chapter}`);
      }

      return {
        book_name: book,
        chapter: chapter,
        verse: verse,
        text: verseData.text
      };
    } catch (error) {
      console.error('Error getting verse from XML:', error);
      throw error;
    }
  }

  getAvailableTranslations(): Array<{ id: string; name: string; code: string }> {
    return [
      { id: 'kjv', name: 'King James Version', code: 'kjv' },
      { id: 'niv', name: 'New International Version', code: 'niv' },
      { id: 'esv', name: 'English Standard Version', code: 'esv' }
    ];
  }

  getAvailableBooks(): Array<{ name: string; chapters: number }> {
    return [
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
  }
}

export const xmlBibleParser = new XMLBibleParser();