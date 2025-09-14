const Book = require('../models/Book');

class BookService {
  constructor() {
    this.books = new Map();
    this.nextBookId = 1;
  }

  clear() {
    this.books.clear();
    this.nextBookId = 1;
  }

  createBook(bookData) {
    if (bookData.book_id && this.books.has(bookData.book_id)) {
      throw new Error('book with id: ' + bookData.book_id + ' already exists');
    }

    const book = new Book(bookData);
    
    if (!book.book_id) {
      book.book_id = this.nextBookId++;
    }

    const validation = book.validate();
    if (!validation.isValid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }

    this.books.set(book.book_id, book);
    return book;
  }

  getBook(bookId) {
    return this.books.get(bookId) || null;
  }

  getAllBooks() {
    return Array.from(this.books.values());
  }

  updateBook(bookId, updateData) {
    const book = this.books.get(bookId);
    if (!book) {
      return null;
    }

    book.update(updateData);
    const validation = book.validate();
    if (!validation.isValid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }

    return book;
  }

  deleteBook(bookId) {
    return this.books.delete(bookId);
  }

  searchBooks(query, filters = {}) {
    let results = Array.from(this.books.values());
    
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm) ||
        book.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.category) {
      results = results.filter(book => book.category === filters.category);
    }
    
    if (filters.author) {
      results = results.filter(book => 
        book.author.toLowerCase().includes(filters.author.toLowerCase())
      );
    }
    
    if (filters.availability !== undefined) {
      results = results.filter(book => book.is_available === filters.availability);
    }
    
    if (filters.min_rating) {
      results = results.filter(book => book.rating >= filters.min_rating);
    }
    
    if (filters.max_rating) {
      results = results.filter(book => book.rating <= filters.max_rating);
    }
    
    if (filters.published_after) {
      const afterDate = new Date(filters.published_after);
      results = results.filter(book => 
        book.published_date && new Date(book.published_date) >= afterDate
      );
    }
    
    if (filters.published_before) {
      const beforeDate = new Date(filters.published_before);
      results = results.filter(book => 
        book.published_date && new Date(book.published_date) <= beforeDate
      );
    }
    
    return results;
  }

  isBookBorrowed(bookId) {
    // This would check with TransactionService in a real implementation
    return false;
  }
}

module.exports = BookService;
