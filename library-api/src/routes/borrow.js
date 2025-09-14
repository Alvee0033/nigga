const express = require('express');
const router = express.Router();
const { transactionService, memberService, bookService } = require('../services');
const { validateBorrowBook, validateReturnBook, validateMemberId } = require('../middleware/validation');

// Export services for testing
router.transactionService = transactionService;
router.memberService = memberService;
router.bookService = bookService;

// Q5: Borrow Book - POST /api/borrow
router.post('/borrow', validateBorrowBook, (req, res) => {
  try {
    const { member_id, book_id } = req.body;
    
    // Check if member exists
    const member = memberService.getMember(member_id);
    if (!member) {
      return res.status(404).json({
        message: `member with id: ${member_id} was not found`
      });
    }
    
    // Check if book exists
    const book = bookService.getBook(book_id);
    if (!book) {
      return res.status(404).json({
        message: `book with id: ${book_id} was not found`
      });
    }
    
    const transaction = transactionService.borrowBook(member_id, book_id);
    
    // Update member's borrowing status
    memberService.updateMember(member_id, { has_borrowed: true });
    
    // Update book availability
    bookService.updateBook(book_id, { is_available: false });
    
    // Success Response (200 OK)
    res.status(200).json({
      transaction_id: transaction.transaction_id,
      member_id: transaction.member_id,
      book_id: transaction.book_id,
      borrowed_at: transaction.borrowed_at,
      status: transaction.status
    });
  } catch (error) {
    // Error Response (400 Bad Request)
    res.status(400).json({
      message: error.message
    });
  }
});

// Q6: Return Book - POST /api/return
router.post('/return', validateReturnBook, (req, res) => {
  try {
    const { member_id, book_id } = req.body;
    
    const transaction = transactionService.returnBook(member_id, book_id);
    
    // Update member's borrowing status
    memberService.updateMember(member_id, { has_borrowed: false });
    
    // Update book availability
    bookService.updateBook(book_id, { is_available: true });
    
    // Success Response (200 OK)
    res.status(200).json({
      transaction_id: transaction.transaction_id,
      member_id: transaction.member_id,
      book_id: transaction.book_id,
      returned_at: transaction.returned_at,
      status: transaction.status
    });
  } catch (error) {
    // Error Response (400 Bad Request)
    res.status(400).json({
      message: error.message
    });
  }
});

// Q7: List Borrowed Books - GET /api/borrowed
router.get('/borrowed', (req, res) => {
  const activeTransactions = transactionService.getActiveTransactions();
  
  const borrowedBooks = activeTransactions.map(transaction => {
    const member = memberService.getMember(transaction.member_id);
    const book = bookService.getBook(transaction.book_id);
    
    return {
      transaction_id: transaction.transaction_id,
      member_id: transaction.member_id,
      member_name: member ? member.name : 'Unknown',
      book_id: transaction.book_id,
      book_title: book ? book.title : 'Unknown',
      borrowed_at: transaction.borrowed_at,
      due_date: transaction.due_date
    };
  });
  
  // Success Response (200 OK)
  res.status(200).json({
    borrowed_books: borrowedBooks
  });
});

// Q8: Get Borrowing History - GET /api/borrow/history/{member_id}
router.get('/history/:member_id', validateMemberId, (req, res) => {
  const memberId = parseInt(req.params.member_id);
  
  // Check if member exists
  const member = memberService.getMember(memberId);
  if (!member) {
    return res.status(404).json({
      message: `member with id: ${memberId} was not found`
    });
  }
  
  const history = transactionService.getBorrowingHistory(memberId);
  
  const borrowingHistory = history.map(transaction => {
    const book = bookService.getBook(transaction.book_id);
    
    return {
      transaction_id: transaction.transaction_id,
      book_id: transaction.book_id,
      book_title: book ? book.title : 'Unknown',
      borrowed_at: transaction.borrowed_at,
      returned_at: transaction.returned_at,
      status: transaction.status
    };
  });
  
  // Success Response (200 OK)
  res.status(200).json({
    member_id: memberId,
    member_name: member.name,
    borrowing_history: borrowingHistory
  });
});

// Q10: Get Overdue Books - GET /api/borrow/overdue
router.get('/overdue', (req, res) => {
  const overdueTransactions = transactionService.getOverdueBooks();
  
  const overdueBooks = overdueTransactions.map(transaction => {
    const member = memberService.getMember(transaction.member_id);
    const book = bookService.getBook(transaction.book_id);
    
    return {
      transaction_id: transaction.transaction_id,
      member_id: transaction.member_id,
      member_name: member ? member.name : 'Unknown',
      book_id: transaction.book_id,
      book_title: book ? book.title : 'Unknown',
      borrowed_at: transaction.borrowed_at,
      due_date: transaction.due_date,
      days_overdue: transaction.calculateDaysOverdue()
    };
  });
  
  // Success Response (200 OK)
  res.status(200).json({
    overdue_books: overdueBooks
  });
});

module.exports = router;
