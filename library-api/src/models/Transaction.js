class Transaction {
  constructor(data = {}) {
    this.transaction_id = data.transaction_id || null;
    this.member_id = data.member_id || null;
    this.book_id = data.book_id || null;
    this.status = data.status || 'active'; // active, returned, cancelled
    this.borrowed_at = data.borrowed_at || new Date().toISOString();
    this.returned_at = data.returned_at || null;
    this.due_date = data.due_date || this.calculateDueDate();
    this.fine_amount = data.fine_amount || 0;
    this.notes = data.notes || '';
  }

  calculateDueDate() {
    const borrowedDate = new Date(this.borrowed_at);
    const dueDate = new Date(borrowedDate);
    dueDate.setDate(dueDate.getDate() + 14); // 14 days borrowing period
    return dueDate.toISOString();
  }

  validate() {
    const errors = [];

    if (!this.member_id || !Number.isInteger(this.member_id)) {
      errors.push('Valid member ID is required');
    }

    if (!this.book_id || !Number.isInteger(this.book_id)) {
      errors.push('Valid book ID is required');
    }

    if (!this.status || !['active', 'returned', 'cancelled'].includes(this.status)) {
      errors.push('Status must be active, returned, or cancelled');
    }

    if (this.borrowed_at && !this.isValidDate(this.borrowed_at)) {
      errors.push('Invalid borrowed_at date');
    }

    if (this.returned_at && !this.isValidDate(this.returned_at)) {
      errors.push('Invalid returned_at date');
    }

    if (this.due_date && !this.isValidDate(this.due_date)) {
      errors.push('Invalid due_date');
    }

    if (this.fine_amount && (this.fine_amount < 0 || this.fine_amount > 1000)) {
      errors.push('Fine amount must be between 0 and 1000');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  toJSON() {
    return {
      transaction_id: this.transaction_id,
      member_id: this.member_id,
      book_id: this.book_id,
      status: this.status,
      borrowed_at: this.borrowed_at,
      returned_at: this.returned_at,
      due_date: this.due_date,
      fine_amount: this.fine_amount,
      notes: this.notes
    };
  }

  update(data) {
    const allowedFields = ['status', 'returned_at', 'fine_amount', 'notes'];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        this[field] = data[field];
      }
    });
  }

  return() {
    this.status = 'returned';
    this.returned_at = new Date().toISOString();
  }

  isOverdue() {
    if (this.status !== 'active') return false;
    const now = new Date();
    const due = new Date(this.due_date);
    return now > due;
  }

  calculateDaysOverdue() {
    if (!this.isOverdue()) return 0;
    const now = new Date();
    const due = new Date(this.due_date);
    const diffTime = now - due;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateFine(ratePerDay = 0.50) {
    if (!this.isOverdue()) return 0;
    const daysOverdue = this.calculateDaysOverdue();
    return Math.min(daysOverdue * ratePerDay, 50); // Cap at $50
  }
}

module.exports = Transaction;
