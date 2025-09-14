const MemberService = require('./MemberService');
const BookService = require('./BookService');
const TransactionService = require('./TransactionService');
const ReservationService = require('./ReservationService');

// Create shared service instances
const memberService = new MemberService();
const bookService = new BookService();
const transactionService = new TransactionService();
const reservationService = new ReservationService();

module.exports = {
  memberService,
  bookService,
  transactionService,
  reservationService
};
