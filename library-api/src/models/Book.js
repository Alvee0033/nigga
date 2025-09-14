class Book {
  constructor(data = {}) {
    this.book_id = data.book_id || null;
    this.title = data.title || '';
    this.author = data.author || '';
    this.isbn = data.isbn || '';
    this.is_available = data.is_available !== undefined ? data.is_available : true;
    this.category = data.category || 'General';
    this.published_date = data.published_date || null;
    this.rating = data.rating || 0;
    this.borrowing_count = data.borrowing_count || 0;
    this.popularity_score = data.popularity_score || 0;
    this.reservation_count = data.reservation_count || 0;
    this.description = data.description || '';
    this.pages = data.pages || 0;
    this.language = data.language || 'en';
  }

  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }

    if (!this.author || this.author.trim().length === 0) {
      errors.push('Author is required');
    }

    if (this.author && this.author.length > 100) {
      errors.push('Author must be 100 characters or less');
    }

    if (this.isbn && !this.validateISBN(this.isbn)) {
      errors.push('Invalid ISBN format');
    }

    if (this.book_id && !Number.isInteger(this.book_id)) {
      errors.push('Book ID must be an integer');
    }

    if (this.rating && (this.rating < 0 || this.rating > 5)) {
      errors.push('Rating must be between 0 and 5');
    }

    if (this.pages && (this.pages < 0 || this.pages > 10000)) {
      errors.push('Pages must be between 0 and 10000');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateISBN(isbn) {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    if (cleanISBN.length === 10) {
      return this.validateISBN10(cleanISBN);
    } else if (cleanISBN.length === 13) {
      return this.validateISBN13(cleanISBN);
    }
    
    return false;
  }

  validateISBN10(isbn) {
    if (!/^\d{9}[\dX]$/.test(isbn)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i]) * (10 - i);
    }
    
    const checkDigit = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
    return (sum + checkDigit) % 11 === 0;
  }

  validateISBN13(isbn) {
    if (!/^\d{13}$/.test(isbn)) return false;
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(isbn[12]);
  }

  toJSON() {
    return {
      book_id: this.book_id,
      title: this.title,
      author: this.author,
      isbn: this.isbn,
      is_available: this.is_available,
      category: this.category,
      published_date: this.published_date,
      rating: this.rating,
      borrowing_count: this.borrowing_count,
      popularity_score: this.popularity_score,
      reservation_count: this.reservation_count,
      description: this.description,
      pages: this.pages,
      language: this.language
    };
  }

  update(data) {
    const allowedFields = [
      'title', 'author', 'isbn', 'is_available', 'category', 
      'published_date', 'rating', 'borrowing_count', 'popularity_score',
      'reservation_count', 'description', 'pages', 'language'
    ];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        this[field] = data[field];
      }
    });
  }

  incrementBorrowingCount() {
    this.borrowing_count += 1;
    this.updatePopularityScore();
  }

  updatePopularityScore() {
    const now = new Date();
    const createdDate = new Date(this.created_at || now);
    const daysSinceCreation = Math.max(1, (now - createdDate) / (1000 * 60 * 60 * 24));
    
    let score = Math.log(this.borrowing_count + 1) * 2;
    score += this.rating * 0.5;
    score += Math.max(0, (365 - daysSinceCreation) / 365) * 0.5;
    score += Math.log(this.reservation_count + 1) * 0.3;
    
    this.popularity_score = Math.min(score, 10);
  }
}

module.exports = Book;
