const Reservation = require('../models/Reservation');

class ReservationService {
  constructor() {
    this.reservations = new Map();
  }

  clear() {
    this.reservations.clear();
  }

  createReservation(reservationData) {
    const reservation = new Reservation(reservationData);
    
    const validation = reservation.validate();
    if (!validation.isValid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }
    
    this.reservations.set(reservation.reservation_id, reservation);
    return reservation;
  }

  getReservation(reservationId) {
    return this.reservations.get(reservationId) || null;
  }

  getAllReservations() {
    return Array.from(this.reservations.values());
  }

  getReservationsByMember(memberId) {
    return Array.from(this.reservations.values()).filter(r => r.member_id === memberId);
  }

  getReservationsByBook(bookId) {
    return Array.from(this.reservations.values()).filter(r => r.book_id === bookId);
  }

  getActiveReservations() {
    return Array.from(this.reservations.values()).filter(r => 
      ['pending', 'confirmed', 'queued'].includes(r.status)
    );
  }

  hasActiveReservation(memberId) {
    return this.getActiveReservations().some(r => r.member_id === memberId);
  }

  getReservationQueue(bookId) {
    return this.getReservationsByBook(bookId)
      .filter(r => r.status === 'queued')
      .sort((a, b) => b.priority_score - a.priority_score);
  }
}

module.exports = ReservationService;
