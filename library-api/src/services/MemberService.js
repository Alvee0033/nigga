const Member = require('../models/Member');

class MemberService {
  constructor() {
    this.members = new Map();
    this.nextMemberId = 1;
  }

  // Method to clear all data (for testing)
  clear() {
    this.members.clear();
    this.nextMemberId = 1;
  }

  createMember(memberData) {
    // Check if member with same ID already exists
    if (memberData.member_id && this.members.has(memberData.member_id)) {
      throw new Error('member with id: ' + memberData.member_id + ' already exists');
    }

    const member = new Member(memberData);
    
    // If no member_id provided, generate one
    if (!member.member_id) {
      member.member_id = this.nextMemberId++;
    }

    const validation = member.validate();
    if (!validation.isValid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }

    this.members.set(member.member_id, member);
    return member;
  }

  getMember(memberId) {
    return this.members.get(memberId) || null;
  }

  getAllMembers() {
    return Array.from(this.members.values());
  }

  updateMember(memberId, updateData) {
    const member = this.members.get(memberId);
    if (!member) {
      return null;
    }

    member.update(updateData);
    const validation = member.validate();
    if (!validation.isValid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }

    return member;
  }

  deleteMember(memberId) {
    return this.members.delete(memberId);
  }

  memberExists(memberId) {
    return this.members.has(memberId);
  }
}

module.exports = MemberService;
