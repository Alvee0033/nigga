const Transaction = require('../models/Transaction');

class TransactionService {
  constructor() {
    this.transactions = new Map();
    this.nextTransactionId = 1;
  }

  clear() {
    this.transactions.clear();
    this.nextTransactionId = 1;
  }

  createTransaction(transactionData) {
    const transaction = new Transaction(transactionData);
    transaction.transaction_id = this.nextTransactionId++;
    
    const validation = transaction.validate();
    if (!validation.isValid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }
    
    this.transactions.set(transaction.transaction_id, transaction);
    return transaction;
  }

  getTransaction(transactionId) {
    return this.transactions.get(transactionId) || null;
  }

  getAllTransactions() {
    return Array.from(this.transactions.values());
  }

  getActiveTransactions() {
    return Array.from(this.transactions.values()).filter(t => t.status === 'active');
  }

  getTransactionsByMember(memberId) {
    return Array.from(this.transactions.values()).filter(t => t.member_id === memberId);
  }

  getTransactionsByBook(bookId) {
    return Array.from(this.transactions.values()).filter(t => t.book_id === bookId);
  }

  getOverdueBooks() {
    return this.getActiveTransactions().filter(transaction => transaction.isOverdue());
  }

  hasActiveBorrow(memberId) {
    return this.getActiveTransactions().some(t => t.member_id === memberId);
  }

  isBookCurrentlyBorrowed(bookId) {
    return this.getActiveTransactions().some(t => t.book_id === bookId);
  }

  borrowBook(memberId, bookId) {
    if (this.hasActiveBorrow(memberId)) {
      throw new Error('member with id: ' + memberId + ' has already borrowed a book');
    }

    if (this.isBookCurrentlyBorrowed(bookId)) {
      throw new Error('book with id: ' + bookId + ' is currently borrowed');
    }

    const transaction = this.createTransaction({
      member_id: memberId,
      book_id: bookId,
      status: 'active'
    });

    return transaction;
  }

  returnBook(memberId, bookId) {
    const activeTransaction = this.getActiveTransactions().find(t => 
      t.member_id === memberId && t.book_id === bookId
    );

    if (!activeTransaction) {
      throw new Error('member with id: ' + memberId + ' has not borrowed book with id: ' + bookId);
    }

    activeTransaction.return();
    return activeTransaction;
  }

  getBorrowingHistory(memberId) {
    return this.getTransactionsByMember(memberId);
  }
}

module.exports = TransactionService;
