const express = require('express');
const router = express.Router();
const { memberService } = require('../services');
const { validateCreateMember, validateMemberId } = require('../middleware/validation');

// Export memberService for testing
router.memberService = memberService;

// Q1: Create Member - POST /api/members
router.post('/', validateCreateMember, (req, res) => {
  try {
    const member = memberService.createMember(req.body);
    
    // Success Response (200 OK)
    res.status(200).json({
      member_id: member.member_id,
      name: member.name,
      age: member.age,
      has_borrowed: member.has_borrowed
    });
  } catch (error) {
    // Error Response (400 Bad Request)
    if (error.message.includes('already exists')) {
      res.status(400).json({
        message: error.message
      });
    } else {
      res.status(400).json({
        message: 'Validation failed: ' + error.message
      });
    }
  }
});

// Q2: Get Member Info - GET /api/members/{member_id}
router.get('/:member_id', validateMemberId, (req, res) => {
  const memberId = parseInt(req.params.member_id);
  const member = memberService.getMember(memberId);
  
  if (!member) {
    // Error Response (404 Not Found)
    return res.status(404).json({
      message: `member with id: ${memberId} was not found`
    });
  }
  
  // Success Response (200 OK)
  res.status(200).json({
    member_id: member.member_id,
    name: member.name,
    age: member.age,
    has_borrowed: member.has_borrowed
  });
});

// Q3: List All Members - GET /api/members
router.get('/', (req, res) => {
  const members = memberService.getAllMembers();
  
  // Success Response (200 OK)
  res.status(200).json({
    members: members.map(member => ({
      member_id: member.member_id,
      name: member.name,
      age: member.age
    }))
  });
});

// Q4: Update Member Info - PUT /api/members/{member_id}
router.put('/:member_id', validateMemberId, (req, res) => {
  const memberId = parseInt(req.params.member_id);
  
  try {
    const member = memberService.updateMember(memberId, req.body);
    
    if (!member) {
      // Error Response (404 Not Found)
      return res.status(404).json({
        message: `member with id: ${memberId} was not found`
      });
    }
    
    // Success Response (200 OK)
    res.status(200).json({
      member_id: member.member_id,
      name: member.name,
      age: member.age,
      has_borrowed: member.has_borrowed
    });
  } catch (error) {
    // Error Response (400 Bad Request)
    res.status(400).json({
      message: error.message
    });
  }
});

// Q9: Delete Member - DELETE /api/members/{member_id}
router.delete('/:member_id', validateMemberId, (req, res) => {
  const memberId = parseInt(req.params.member_id);
  const member = memberService.getMember(memberId);
  
  if (!member) {
    // Error Response (404 Not Found)
    return res.status(404).json({
      message: `member with id: ${memberId} was not found`
    });
  }
  
  // Check if member has active borrows (simplified check)
  if (member.has_borrowed) {
    // Error Response (400 Bad Request)
    return res.status(400).json({
      message: `cannot delete member with id: ${memberId}, member has an active book borrowing`
    });
  }
  
  const deleted = memberService.deleteMember(memberId);
  
  if (deleted) {
    // Success Response (200 OK)
    res.status(200).json({
      message: `member with id: ${memberId} has been deleted successfully`
    });
  } else {
    res.status(500).json({
      message: 'Failed to delete member'
    });
  }
});

module.exports = router;
