const request = require('supertest');
const app = require('../src/app');

describe('Library API Integration Tests', () => {
  let memberId, bookId, transactionId;

  beforeEach(() => {
    // Clear all data before each test
    const memberRoutes = require('../src/routes/members');
    const bookRoutes = require('../src/routes/books');
    const borrowRoutes = require('../src/routes/borrow');
    const reservationRoutes = require('../src/routes/reservations');

    memberRoutes.memberService.clear();
    bookRoutes.bookService.clear();
    borrowRoutes.transactionService.clear();
    reservationRoutes.reservationService.clear();
  });

  describe('Complete Library Workflow', () => {
    it('should handle complete member and book lifecycle', async () => {
      // 1. Create a member
      const memberResponse = await request(app)
        .post('/api/members')
        .send({
          name: 'John Doe',
          age: 25
        })
        .expect(200);

      memberId = memberResponse.body.member_id;
      expect(memberResponse.body.name).toBe('John Doe');
      expect(memberResponse.body.age).toBe(25);
      expect(memberResponse.body.has_borrowed).toBe(false);

      // 2. Create a book
      const bookResponse = await request(app)
        .post('/api/books')
        .send({
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          isbn: '978-0743273565',
          category: 'Fiction',
          rating: 4.5
        })
        .expect(200);

      bookId = bookResponse.body.book_id;
      expect(bookResponse.body.title).toBe('The Great Gatsby');
      expect(bookResponse.body.author).toBe('F. Scott Fitzgerald');
      expect(bookResponse.body.is_available).toBe(true);

      // 3. Borrow the book
      const borrowResponse = await request(app)
        .post('/api/borrow')
        .send({
          member_id: memberId,
          book_id: bookId
        })
        .expect(200);

      transactionId = borrowResponse.body.transaction_id;
      expect(borrowResponse.body.member_id).toBe(memberId);
      expect(borrowResponse.body.book_id).toBe(bookId);
      expect(borrowResponse.body.status).toBe('active');

      // 4. Verify member has borrowed status
      const memberCheckResponse = await request(app)
        .get(`/api/members/${memberId}`)
        .expect(200);

      expect(memberCheckResponse.body.has_borrowed).toBe(true);

      // 5. Verify book is not available
      const bookCheckResponse = await request(app)
        .get(`/api/books/${bookId}`)
        .expect(200);

      expect(bookCheckResponse.body.is_available).toBe(false);

      // 6. List borrowed books
      const borrowedResponse = await request(app)
        .get('/api/borrowed')
        .expect(200);

      expect(borrowedResponse.body.borrowed_books).toHaveLength(1);
      expect(borrowedResponse.body.borrowed_books[0].member_id).toBe(memberId);
      expect(borrowedResponse.body.borrowed_books[0].book_id).toBe(bookId);

      // 7. Get borrowing history
      const historyResponse = await request(app)
        .get(`/api/borrow/history/${memberId}`)
        .expect(200);

      expect(historyResponse.body.member_id).toBe(memberId);
      expect(historyResponse.body.borrowing_history).toHaveLength(1);
      expect(historyResponse.body.borrowing_history[0].status).toBe('active');

      // 8. Return the book
      const returnResponse = await request(app)
        .post('/api/return')
        .send({
          member_id: memberId,
          book_id: bookId
        })
        .expect(200);

      expect(returnResponse.body.status).toBe('returned');

      // 9. Verify member no longer has borrowed status
      const memberFinalResponse = await request(app)
        .get(`/api/members/${memberId}`)
        .expect(200);

      expect(memberFinalResponse.body.has_borrowed).toBe(false);

      // 10. Verify book is available again
      const bookFinalResponse = await request(app)
        .get(`/api/books/${bookId}`)
        .expect(200);

      expect(bookFinalResponse.body.is_available).toBe(true);
    });

    it('should handle advanced book search', async () => {
      // Create multiple books
      const books = [
        { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', rating: 4.5 },
        { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', rating: 4.8 },
        { title: '1984', author: 'George Orwell', category: 'Dystopian', rating: 4.3 },
        { title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy', rating: 4.7 }
      ];

      for (const book of books) {
        await request(app)
          .post('/api/books')
          .send(book)
          .expect(200);
      }

      // Search by category
      const categorySearch = await request(app)
        .get('/api/books/search?category=Fiction&include_analytics=true')
        .expect(200);

      expect(categorySearch.body.books).toHaveLength(2);
      expect(categorySearch.body.analytics).toBeDefined();

      // Search by author
      const authorSearch = await request(app)
        .get('/api/books/search?author=Tolkien')
        .expect(200);

      expect(authorSearch.body.books).toHaveLength(1);
      expect(authorSearch.body.books[0].title).toBe('The Hobbit');

      // Search with rating filter
      const ratingSearch = await request(app)
        .get('/api/books/search?min_rating=4.5')
        .expect(200);

      expect(ratingSearch.body.books.length).toBeGreaterThan(0);
      ratingSearch.body.books.forEach(book => {
        expect(book.rating).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should handle reservation system', async () => {
      // Create member and book
      const memberResponse = await request(app)
        .post('/api/members')
        .send({ name: 'Jane Doe', age: 30 })
        .expect(200);

      const bookResponse = await request(app)
        .post('/api/books')
        .send({ title: 'Reserved Book', author: 'Test Author' })
        .expect(200);

      // Create reservation
      const reservationResponse = await request(app)
        .post('/api/reservations')
        .send({
          member_id: memberResponse.body.member_id,
          book_id: bookResponse.body.book_id,
          reservation_type: 'premium',
          fee_paid: 5.00
        })
        .expect(200);

      expect(reservationResponse.body.reservation_id).toBeDefined();
      expect(reservationResponse.body.reservation_status).toBe('confirmed');
      expect(reservationResponse.body.priority_score).toBeGreaterThan(0);
    });

    it('should prevent duplicate member creation', async () => {
      // Create first member
      await request(app)
        .post('/api/members')
        .send({ member_id: 1, name: 'John Doe', age: 25 })
        .expect(200);

      // Try to create member with same ID
      const duplicateResponse = await request(app)
        .post('/api/members')
        .send({ member_id: 1, name: 'Jane Doe', age: 30 })
        .expect(400);

      expect(duplicateResponse.body.message).toContain('already exists');
    });

    it('should prevent borrowing when member already has active borrow', async () => {
      // Create member and two books
      const memberResponse = await request(app)
        .post('/api/members')
        .send({ name: 'John Doe', age: 25 })
        .expect(200);

      const book1Response = await request(app)
        .post('/api/books')
        .send({ title: 'Book 1', author: 'Author 1' })
        .expect(200);

      const book2Response = await request(app)
        .post('/api/books')
        .send({ title: 'Book 2', author: 'Author 2' })
        .expect(200);

      // Borrow first book
      await request(app)
        .post('/api/borrow')
        .send({
          member_id: memberResponse.body.member_id,
          book_id: book1Response.body.book_id
        })
        .expect(200);

      // Try to borrow second book
      const secondBorrowResponse = await request(app)
        .post('/api/borrow')
        .send({
          member_id: memberResponse.body.member_id,
          book_id: book2Response.body.book_id
        })
        .expect(400);

      expect(secondBorrowResponse.body.message).toContain('already borrowed');
    });

    it('should prevent deleting member with active borrows', async () => {
      // Create member and book
      const memberResponse = await request(app)
        .post('/api/members')
        .send({ name: 'John Doe', age: 25 })
        .expect(200);

      const bookResponse = await request(app)
        .post('/api/books')
        .send({ title: 'Test Book', author: 'Test Author' })
        .expect(200);

      // Borrow book
      await request(app)
        .post('/api/borrow')
        .send({
          member_id: memberResponse.body.member_id,
          book_id: bookResponse.body.book_id
        })
        .expect(200);

      // Try to delete member
      const deleteResponse = await request(app)
        .delete(`/api/members/${memberResponse.body.member_id}`)
        .expect(400);

      expect(deleteResponse.body.message).toContain('active book borrowing');
    });

    it('should handle overdue books', async () => {
      // Create member and book
      const memberResponse = await request(app)
        .post('/api/members')
        .send({ name: 'John Doe', age: 25 })
        .expect(200);

      const bookResponse = await request(app)
        .post('/api/books')
        .send({ title: 'Test Book', author: 'Test Author' })
        .expect(200);

      // Borrow book
      await request(app)
        .post('/api/borrow')
        .send({
          member_id: memberResponse.body.member_id,
          book_id: bookResponse.body.book_id
        })
        .expect(200);

      // Get overdue books (should be empty since book was just borrowed)
      const overdueResponse = await request(app)
        .get('/api/borrow/overdue')
        .expect(200);

      expect(overdueResponse.body.overdue_books).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent member', async () => {
      const response = await request(app)
        .get('/api/members/999')
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app)
        .get('/api/books/999')
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should validate member age', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({ name: 'John Doe', age: 10 })
        .expect(400);

      expect(response.body.message).toContain('Age must be between 12 and 120');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({ age: 25 })
        .expect(400);

      expect(response.body.message).toContain('Name is required');
    });
  });
});
