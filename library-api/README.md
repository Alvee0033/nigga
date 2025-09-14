# 📚 Library Management API

A comprehensive, robust Node.js API for library management with advanced features including member management, book cataloging, borrowing system, and sophisticated reservation system.

## ✨ Features

### 👥 Member Management
- **POST** `/api/members` - Register new members with ID, name, age validation
- **GET** `/api/members/{member_id}` - Retrieve specific member details
- **GET** `/api/members` - Get all registered members
- **PUT** `/api/members/{member_id}` - Update member details with age validation (minimum 12 years)
- **DELETE** `/api/members/{member_id}` - Remove members (validates no active borrows)

### 📖 Book Management
- **POST** `/api/books` - Add new books with ID, title, author, ISBN
- **GET** `/api/books/{book_id}` - Retrieve specific book details and availability
- **DELETE** `/api/books/{book_id}` - Remove books (validates not currently borrowed)

### 📚 Borrowing System
- **POST** `/api/borrow` - Process book borrowing (prevents multiple active borrows per member)
- **POST** `/api/return` - Process book returns and update status
- **GET** `/api/borrowed` - Show all currently borrowed books with details
- **GET** `/api/borrow/history/{member_id}` - Complete borrowing history for a member
- **GET** `/api/borrow/overdue` - List books past due date with member info

### 🎫 Advanced Features
- **GET** `/api/books/search` - Complex search with filtering, sorting, pagination, analytics, fuzzy matching, and personalization
- **POST** `/api/reservations` - Sophisticated reservation with priority queuing, notifications, group reservations, and dynamic pricing

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd library-api
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

5. Open the web interface:
```
http://localhost:3000
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Create Member
**POST** `/api/members`

**Request Body:**
```json
{
  "member_id": 1,
  "name": "Alice",
  "age": 22
}
```

**Success Response (200 OK):**
```json
{
  "member_id": 1,
  "name": "Alice",
  "age": 22,
  "has_borrowed": false
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "member with id: 1 already exists"
}
```

### Get Member Info
**GET** `/api/members/{member_id}`

**Success Response (200 OK):**
```json
{
  "member_id": 1,
  "name": "Alice",
  "age": 22,
  "has_borrowed": false
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "member with id: 5 was not found"
}
```

### List All Members
**GET** `/api/members`

**Success Response (200 OK):**
```json
{
  "members": [
    {
      "member_id": 1,
      "name": "Alice",
      "age": 22
    },
    {
      "member_id": 2,
      "name": "Bob",
      "age": 30
    }
  ]
}
```

### Update Member Info
**PUT** `/api/members/{member_id}`

**Request Body:**
```json
{
  "name": "Alice Smith",
  "age": 25
}
```

**Success Response (200 OK):**
```json
{
  "member_id": 1,
  "name": "Alice Smith",
  "age": 25,
  "has_borrowed": false
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "invalid age: 10, must be 12 or older"
}
```

### Delete Member
**DELETE** `/api/members/{member_id}`

**Success Response (200 OK):**
```json
{
  "message": "member with id: 1 has been deleted successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "cannot delete member with id: 1, member has an active book borrowing"
}
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Validation Rules

### Member Creation/Update
- **name**: Required, 1-100 characters
- **age**: Required, integer between 12-120
- **member_id**: Optional, positive integer (auto-generated if not provided)

### Error Handling
- Comprehensive input validation
- Duplicate member ID prevention
- Age validation (minimum 12 years)
- Proper HTTP status codes
- Detailed error messages

## Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Centralized error handling middleware

## Project Structure

```
library-api/
├── src/
│   ├── models/
│   │   └── Member.js          # Member data model
│   ├── services/
│   │   └── MemberService.js   # Member business logic
│   ├── routes/
│   │   └── members.js         # Member API routes
│   ├── middleware/
│   │   └── validation.js      # Input validation
│   └── app.js                 # Express app setup
├── tests/
│   ├── members.test.js        # Member API tests
│   └── setup.js              # Test setup
├── package.json
├── jest.config.js
└── README.md
```

## Health Check

**GET** `/health`

Returns server status and uptime information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
