class Reservation {
  constructor(data = {}) {
    this.reservation_id = data.reservation_id || this.generateReservationId();
    this.member_id = data.member_id || null;
    this.book_id = data.book_id || null;
    this.reservation_type = data.reservation_type || 'standard'; // standard, premium, group
    this.status = data.status || 'pending'; // pending, confirmed, queued, cancelled, expired
    this.created_at = data.created_at || new Date().toISOString();
    this.expires_at = data.expires_at || this.calculateExpirationDate();
    this.preferred_pickup_date = data.preferred_pickup_date || null;
    this.max_wait_days = data.max_wait_days || 14;
    this.queue_position = data.queue_position || 0;
    this.priority_score = data.priority_score || 0;
    this.estimated_availability_date = data.estimated_availability_date || null;
    this.pickup_window_start = data.pickup_window_start || null;
    this.pickup_window_end = data.pickup_window_end || null;
    this.fee_paid = data.fee_paid || 0;
    this.notification_preferences = data.notification_preferences || {
      email: true,
      sms: false,
      push: true
    };
    this.group_reservation = data.group_reservation || null;
    this.special_requests = data.special_requests || {};
    this.payment_info = data.payment_info || {};
  }

  generateReservationId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RES-${year}${month}${day}-${random}`;
  }

  calculateExpirationDate() {
    const createdDate = new Date(this.created_at);
    const expirationDate = new Date(createdDate);
    expirationDate.setDate(expirationDate.getDate() + 14); // 14 days expiration
    return expirationDate.toISOString();
  }

  validate() {
    const errors = [];

    if (!this.member_id || !Number.isInteger(this.member_id)) {
      errors.push('Valid member ID is required');
    }

    if (!this.book_id || !Number.isInteger(this.book_id)) {
      errors.push('Valid book ID is required');
    }

    if (!this.reservation_type || !['standard', 'premium', 'group'].includes(this.reservation_type)) {
      errors.push('Reservation type must be standard, premium, or group');
    }

    if (!this.status || !['pending', 'confirmed', 'queued', 'cancelled', 'expired'].includes(this.status)) {
      errors.push('Invalid reservation status');
    }

    if (this.max_wait_days && (this.max_wait_days < 1 || this.max_wait_days > 30)) {
      errors.push('Max wait days must be between 1 and 30');
    }

    if (this.fee_paid && (this.fee_paid < 0 || this.fee_paid > 100)) {
      errors.push('Fee paid must be between 0 and 100');
    }

    if (this.preferred_pickup_date && !this.isValidDate(this.preferred_pickup_date)) {
      errors.push('Invalid preferred pickup date');
    }

    if (this.group_reservation && !this.validateGroupReservation()) {
      errors.push('Invalid group reservation data');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateGroupReservation() {
    if (!this.group_reservation) return true;
    
    const { group_id, group_size, coordinator_member_id } = this.group_reservation;
    
    if (!group_id || typeof group_id !== 'string') return false;
    if (!group_size || !Number.isInteger(group_size) || group_size < 2 || group_size > 10) return false;
    if (!coordinator_member_id || !Number.isInteger(coordinator_member_id)) return false;
    
    return true;
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  toJSON() {
    return {
      reservation_id: this.reservation_id,
      member_id: this.member_id,
      book_id: this.book_id,
      reservation_type: this.reservation_type,
      status: this.status,
      created_at: this.created_at,
      expires_at: this.expires_at,
      preferred_pickup_date: this.preferred_pickup_date,
      max_wait_days: this.max_wait_days,
      queue_position: this.queue_position,
      priority_score: this.priority_score,
      estimated_availability_date: this.estimated_availability_date,
      pickup_window_start: this.pickup_window_start,
      pickup_window_end: this.pickup_window_end,
      fee_paid: this.fee_paid,
      notification_preferences: this.notification_preferences,
      group_reservation: this.group_reservation,
      special_requests: this.special_requests,
      payment_info: this.payment_info
    };
  }

  update(data) {
    const allowedFields = [
      'reservation_type', 'status', 'preferred_pickup_date', 'max_wait_days',
      'queue_position', 'priority_score', 'estimated_availability_date',
      'pickup_window_start', 'pickup_window_end', 'fee_paid',
      'notification_preferences', 'group_reservation', 'special_requests', 'payment_info'
    ];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        this[field] = data[field];
      }
    });
  }

  confirm() {
    this.status = 'confirmed';
  }

  queue(position) {
    this.status = 'queued';
    this.queue_position = position;
  }

  cancel() {
    this.status = 'cancelled';
  }

  expire() {
    this.status = 'expired';
  }

  isExpired() {
    const now = new Date();
    const expirationDate = new Date(this.expires_at);
    return now > expirationDate && this.status === 'pending';
  }

  calculatePriorityScore(member) {
    let score = 0;
    
    const typeScores = { standard: 1, premium: 2, group: 1.5 };
    score += typeScores[this.reservation_type] || 1;
    
    if (member) {
      score += member.calculatePriorityScore() * 0.3;
    }
    
    if (this.special_requests.academic_priority) {
      score += 1;
    }
    if (this.special_requests.accessibility_needs) {
      score += 0.5;
    }
    
    score += this.fee_paid * 0.1;
    
    if (this.group_reservation) {
      score += 0.2;
    }
    
    this.priority_score = Math.min(score, 10);
    return this.priority_score;
  }
}

module.exports = Reservation;
