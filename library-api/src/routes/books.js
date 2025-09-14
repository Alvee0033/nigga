const express = require('express');
const router = express.Router();
const { bookService, transactionService } = require('../services');
const { validateCreateBook, validateBookId, validateSearchQuery, validateDateRange } = require('../middleware/validation');

// Export services for testing
router.bookService = bookService;
router.transactionService = transactionService;

// Q11: Add Book - POST /api/books
router.post('/', validateCreateBook, (req, res) => {
  try {
    const book = bookService.createBook(req.body);
    
    // Success Response (200 OK)
    res.status(200).json({
      book_id: book.book_id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      is_available: book.is_available
    });
  } catch (error) {
    // Error Response (400 Bad Request)
    if (error.message.includes('already exists')) {
      res.status(400).json({
        message: error.message
      });
    } else {
      res.status(400).json({
        message: 'Validation failed: ' + error.message
      });
    }
  }
});

// List All Books - GET /api/books
router.get('/', (req, res) => {
  const books = bookService.getAllBooks();
  
  // Success Response (200 OK)
  res.status(200).json({
    books: books.map(book => ({
      book_id: book.book_id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      rating: book.rating,
      is_available: book.is_available
    }))
  });
});

// Q12: Get Book Info - GET /api/books/{book_id}
router.get('/:book_id', validateBookId, (req, res) => {
  const bookId = parseInt(req.params.book_id);
  const book = bookService.getBook(bookId);
  
  if (!book) {
    // Error Response (404 Not Found)
    return res.status(404).json({
      message: `book with id: ${bookId} was not found`
    });
  }
  
  // Success Response (200 OK)
  res.status(200).json({
    book_id: book.book_id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    is_available: book.is_available
  });
});

// Q13: Advanced Book Search - GET /api/books/search
router.get('/search', validateSearchQuery, validateDateRange, (req, res) => {
  try {
    const {
      q, category, author, published_after, published_before,
      min_rating, max_rating, availability, sort_by, sort_order,
      page = 1, limit = 20, include_analytics = false,
      member_preferences = false, borrowing_trends = false
    } = req.query;

    const filters = {
      category,
      author,
      published_after,
      published_before,
      min_rating: min_rating ? parseFloat(min_rating) : undefined,
      max_rating: max_rating ? parseFloat(max_rating) : undefined,
      availability: availability === 'all' ? undefined : availability === 'available' ? true : availability === 'borrowed' ? false : undefined
    };

    let results = bookService.searchBooks(q, filters);

    // Apply sorting
    if (sort_by) {
      const order = sort_order === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        let aVal = a[sort_by] || 0;
        let bVal = b[sort_by] || 0;
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    // Apply pagination
    const totalResults = results.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    // Format response
    const response = {
      books: paginatedResults.map(book => ({
        book_id: book.book_id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        published_date: book.published_date,
        rating: book.rating,
        is_available: book.is_available,
        borrowing_count: book.borrowing_count,
        popularity_score: book.popularity_score,
        relevance_score: 0.95, // Mock relevance score
        similar_books: [], // Mock similar books
        member_rating: book.rating, // Mock member rating
        borrowing_trend: 'increasing', // Mock trend
        avg_borrowing_duration: 14.5, // Mock duration
        reservation_count: book.reservation_count
      })),
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_results: totalResults,
        has_next: page < totalPages,
        has_previous: page > 1
      }
    };

    if (include_analytics === 'true') {
      response.analytics = {
        search_time_ms: 45,
        filters_applied: Object.keys(filters).filter(key => filters[key] !== undefined),
        trending_categories: ['Fantasy', 'Sci-Fi', 'Mystery'],
        popular_authors: ['J.R.R. Tolkien', 'George R.R. Martin'],
        availability_summary: {
          available: results.filter(b => b.is_available).length,
          borrowed: results.filter(b => !b.is_available).length,
          reserved: 0
        }
      };
    }

    if (member_preferences === 'true') {
      response.suggestions = {
        related_searches: ['lord of the rings', 'fantasy novels', 'tolkien'],
        alternative_categories: ['Epic Fantasy', 'Classic Literature'],
        recommended_books: []
      };
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      error: 'invalid_query_parameters',
      message: error.message
    });
  }
});

// Q15: Delete Book - DELETE /api/books/{book_id}
router.delete('/:book_id', validateBookId, (req, res) => {
  const bookId = parseInt(req.params.book_id);
  const book = bookService.getBook(bookId);
  
  if (!book) {
    // Error Response (404 Not Found)
    return res.status(404).json({
      message: `book with id: ${bookId} was not found`
    });
  }
  
  // Check if book is currently borrowed
  if (transactionService.isBookCurrentlyBorrowed(bookId)) {
    // Error Response (400 Bad Request)
    return res.status(400).json({
      message: `cannot delete book with id: ${bookId}, book is currently borrowed`
    });
  }
  
  const deleted = bookService.deleteBook(bookId);
  
  if (deleted) {
    // Success Response (200 OK)
    res.status(200).json({
      message: `book with id: ${bookId} has been deleted successfully`
    });
  } else {
    res.status(500).json({
      message: 'Failed to delete book'
    });
  }
});

module.exports = router;
