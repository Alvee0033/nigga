class Member {
  constructor(data = {}) {
    this.member_id = data.member_id || null;
    this.name = data.name || '';
    this.age = data.age || 0;
    this.has_borrowed = data.has_borrowed || false;
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (this.name && this.name.length > 100) {
      errors.push('Name must be 100 characters or less');
    }

    if (!this.age || this.age < 12) {
      errors.push('Age must be 12 or older');
    }

    if (this.age && this.age > 120) {
      errors.push('Age must be 120 or younger');
    }

    if (this.member_id && !Number.isInteger(this.member_id)) {
      errors.push('Member ID must be an integer');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      member_id: this.member_id,
      name: this.name,
      age: this.age,
      has_borrowed: this.has_borrowed
    };
  }

  update(data) {
    const allowedFields = ['name', 'age', 'has_borrowed'];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        this[field] = data[field];
      }
    });
  }

  calculatePriorityScore() {
    // Simple priority score calculation
    let score = 1; // Base score
    
    // Add age factor (older members get slight priority)
    if (this.age > 18) score += 0.5;
    if (this.age > 65) score += 0.5;
    
    // Add borrowing history factor (if has_borrowed is true, they're active)
    if (this.has_borrowed) score += 1;
    
    return Math.min(score, 10); // Cap at 10
  }
}

module.exports = Member;
