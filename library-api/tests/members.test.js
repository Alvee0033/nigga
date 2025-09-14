const request = require('supertest');
const app = require('../src/app');
const memberRoutes = require('../src/routes/members');

describe('Member API Tests', () => {
  beforeEach(() => {
    // Clear any existing data before each test
    memberRoutes.memberService.clear();
  });

  describe('POST /api/members - Create Member', () => {
    it('should create a new member successfully', async () => {
      const memberData = {
        member_id: 1,
        name: 'Alice',
        age: 22
      };

      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(200);

      expect(response.body).toEqual({
        member_id: 1,
        name: 'Alice',
        age: 22,
        has_borrowed: false
      });
    });

    it('should create a member without member_id (auto-generated)', async () => {
      const memberData = {
        name: 'Bob',
        age: 30
      };

      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Bob',
        age: 30,
        has_borrowed: false
      });
      expect(response.body.member_id).toBeDefined();
    });

    it('should return 400 when member with same ID already exists', async () => {
      const memberData = {
        member_id: 1,
        name: 'Alice',
        age: 22
      };

      // Create first member
      await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(200);

      // Try to create member with same ID
      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(400);

      expect(response.body).toEqual({
        message: 'member with id: 1 already exists'
      });
    });

    it('should return 400 when name is missing', async () => {
      const memberData = {
        member_id: 1,
        age: 22
      };

      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(400);

      expect(response.body.message).toContain('Name is required');
    });

    it('should return 400 when age is less than 12', async () => {
      const memberData = {
        member_id: 1,
        name: 'Alice',
        age: 10
      };

      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(400);

      expect(response.body.message).toContain('Age must be between 12 and 120');
    });

    it('should return 400 when age is greater than 120', async () => {
      const memberData = {
        member_id: 1,
        name: 'Alice',
        age: 150
      };

      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(400);

      expect(response.body.message).toContain('Age must be between 12 and 120');
    });

    it('should return 400 when name is too long', async () => {
      const memberData = {
        member_id: 1,
        name: 'A'.repeat(101),
        age: 22
      };

      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(400);

      expect(response.body.message).toContain('Name must be between 1 and 100 characters');
    });

    it('should return 400 when member_id is not an integer', async () => {
      const memberData = {
        member_id: 'invalid',
        name: 'Alice',
        age: 22
      };

      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(400);

      expect(response.body.message).toContain('Member ID must be a positive integer');
    });

    it('should return 400 when age is not an integer', async () => {
      const memberData = {
        member_id: 1,
        name: 'Alice',
        age: 'twenty-two'
      };

      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(400);

      expect(response.body.message).toContain('Age must be between 12 and 120');
    });
  });

  describe('GET /api/members/:member_id - Get Member Info', () => {
    beforeEach(async () => {
      // Create a test member
      await request(app)
        .post('/api/members')
        .send({
          member_id: 1,
          name: 'Alice',
          age: 22
        });
    });

    it('should get member info successfully', async () => {
      const response = await request(app)
        .get('/api/members/1')
        .expect(200);

      expect(response.body).toEqual({
        member_id: 1,
        name: 'Alice',
        age: 22,
        has_borrowed: false
      });
    });

    it('should return 404 when member not found', async () => {
      const response = await request(app)
        .get('/api/members/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'member with id: 999 was not found'
      });
    });

    it('should return 400 when member_id is invalid', async () => {
      const response = await request(app)
        .get('/api/members/invalid')
        .expect(400);

      expect(response.body.message).toContain('Member ID must be a positive integer');
    });
  });

  describe('GET /api/members - List All Members', () => {
    beforeEach(async () => {
      // Create test members
      await request(app)
        .post('/api/members')
        .send({
          member_id: 1,
          name: 'Alice',
          age: 22
        });

      await request(app)
        .post('/api/members')
        .send({
          member_id: 2,
          name: 'Bob',
          age: 30
        });
    });

    it('should list all members successfully', async () => {
      const response = await request(app)
        .get('/api/members')
        .expect(200);

      expect(response.body).toEqual({
        members: [
          {
            member_id: 1,
            name: 'Alice',
            age: 22
          },
          {
            member_id: 2,
            name: 'Bob',
            age: 30
          }
        ]
      });
    });
  });

  describe('PUT /api/members/:member_id - Update Member Info', () => {
    beforeEach(async () => {
      // Create a test member
      await request(app)
        .post('/api/members')
        .send({
          member_id: 1,
          name: 'Alice',
          age: 22
        });
    });

    it('should update member info successfully', async () => {
      const updateData = {
        name: 'Alice Smith',
        age: 25
      };

      const response = await request(app)
        .put('/api/members/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        member_id: 1,
        name: 'Alice Smith',
        age: 25,
        has_borrowed: false
      });
    });

    it('should return 404 when member not found', async () => {
      const updateData = {
        name: 'Alice Smith',
        age: 25
      };

      const response = await request(app)
        .put('/api/members/999')
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        message: 'member with id: 999 was not found'
      });
    });

    it('should return 400 when age is invalid', async () => {
      const updateData = {
        name: 'Alice Smith',
        age: 10
      };

      const response = await request(app)
        .put('/api/members/1')
        .send(updateData)
        .expect(400);

      expect(response.body.message).toContain('Age must be between 12 and 120');
    });
  });

  describe('DELETE /api/members/:member_id - Delete Member', () => {
    beforeEach(async () => {
      // Create a test member
      await request(app)
        .post('/api/members')
        .send({
          member_id: 1,
          name: 'Alice',
          age: 22
        });
    });

    it('should delete member successfully', async () => {
      const response = await request(app)
        .delete('/api/members/1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'member with id: 1 has been deleted successfully'
      });
    });

    it('should return 404 when member not found', async () => {
      const response = await request(app)
        .delete('/api/members/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'member with id: 999 was not found'
      });
    });

    it('should return 400 when member has active borrows', async () => {
      // First, set member as having borrowed a book
      await request(app)
        .put('/api/members/1')
        .send({ has_borrowed: true });

      const response = await request(app)
        .delete('/api/members/1')
        .expect(400);

      expect(response.body).toEqual({
        message: 'cannot delete member with id: 1, member has an active book borrowing'
      });
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      });
    });
  });
});
