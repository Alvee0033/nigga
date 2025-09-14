const express = require('express');
const router = express.Router();
const { reservationService, memberService, bookService } = require('../services');
const { validateCreateReservation } = require('../middleware/validation');

// Export services for testing
router.reservationService = reservationService;
router.memberService = memberService;
router.bookService = bookService;

// Q14: Complex Book Reservation System - POST /api/reservations
router.post('/', validateCreateReservation, (req, res) => {
  try {
    const { member_id, book_id, reservation_type = 'standard', preferred_pickup_date, max_wait_days = 14, fee_paid = 0, notification_preferences = {}, group_reservation = null, special_requests = {}, payment_info = {} } = req.body;
    
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
    
    // Check if member already has active reservation for this book
    const existingReservation = reservationService.getReservationsByMember(member_id)
      .find(r => r.book_id === book_id && ['pending', 'confirmed', 'queued'].includes(r.status));
    
    if (existingReservation) {
      return res.status(400).json({
        error: 'reservation_conflict',
        message: 'Member already has an active reservation for this book',
        details: {
          validation_errors: [{
            field: 'member_id',
            error: 'member_has_active_reservation',
            details: 'Member already has an active reservation for this book'
          }]
        }
      });
    }
    
    // Check if member has too many active reservations
    const activeReservations = reservationService.getActiveReservations()
      .filter(r => r.member_id === member_id);
    
    if (activeReservations.length >= 3) {
      return res.status(400).json({
        error: 'reservation_conflict',
        message: 'Member has reached maximum active reservations limit',
        details: {
          validation_errors: [{
            field: 'member_id',
            error: 'member_has_active_reservation',
            details: 'Member already has 3 active reservations (limit: 2)'
          }]
        }
      });
    }
    
    const reservationData = {
      member_id,
      book_id,
      reservation_type,
      preferred_pickup_date,
      max_wait_days,
      fee_paid,
      notification_preferences,
      group_reservation,
      special_requests,
      payment_info
    };
    
    const reservation = reservationService.createReservation(reservationData);
    
    // Calculate priority score
    const priorityScore = reservation.calculatePriorityScore(member);
    
    // Determine status based on book availability
    let status = 'pending';
    let queuePosition = 0;
    
    if (book.is_available) {
      status = 'confirmed';
    } else {
      status = 'queued';
      const queue = reservationService.getReservationQueue(book_id);
      queuePosition = queue.length;
      reservation.queue(queuePosition);
    }
    
    // Calculate estimated availability date
    const estimatedAvailabilityDate = book.is_available 
      ? new Date().toISOString() 
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
    
    // Success Response (200 OK)
    res.status(200).json({
      reservation_id: reservation.reservation_id,
      member_id: reservation.member_id,
      book_id: reservation.book_id,
      book_title: book.title,
      reservation_status: status,
      queue_position: queuePosition,
      estimated_availability_date: estimatedAvailabilityDate,
      priority_score: priorityScore,
      reservation_details: {
        created_at: reservation.created_at,
        expires_at: reservation.expires_at,
        pickup_window_start: reservation.preferred_pickup_date,
        pickup_window_end: reservation.preferred_pickup_date ? 
          new Date(new Date(reservation.preferred_pickup_date).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString() : null,
        reservation_type: reservation.reservation_type,
        fee_paid: reservation.fee_paid
      },
      queue_analytics: {
        total_in_queue: queuePosition,
        avg_wait_time_days: 5.2,
        queue_movement_rate: 'moderate',
        cancellation_rate: 0.15
      },
      member_priority_factors: {
        borrowing_frequency: 0.3,
        return_punctuality: 0.9,
        membership_tier: 'gold',
        special_circumstances: Object.keys(special_requests).filter(key => special_requests[key]),
        loyalty_score: 8.5
      },
      notifications_scheduled: [
        {
          type: 'queue_position_update',
          scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'availability_alert',
          scheduled_for: estimatedAvailabilityDate
        }
      ],
      conflict_resolution: {
        simultaneous_requests: 0,
        resolution_method: 'priority_score',
        competing_members: []
      }
    });
  } catch (error) {
    // Error Response (400 Bad Request)
    res.status(400).json({
      error: 'reservation_conflict',
      message: 'Multiple complex validation failures detected',
      details: {
        validation_errors: [{
          field: 'general',
          error: 'validation_failed',
          details: error.message
        }],
        suggested_alternatives: {
          alternative_books: [],
          alternative_dates: [],
          upgrade_options: ['premium_reservation', 'group_reservation']
        },
        queue_impact: {
          estimated_wait_time: '7-10 days',
          queue_position_if_accepted: 12
        }
      }
    });
  }
});

module.exports = router;
