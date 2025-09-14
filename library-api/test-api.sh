#!/bin/bash

echo "🚀 Testing Library Management API"
echo "================================="

BASE_URL="http://localhost:3000/api"

echo ""
echo "1. Creating a member..."
MEMBER_RESPONSE=$(curl -s -X POST $BASE_URL/members -H "Content-Type: application/json" -d '{"name":"Alice Johnson","age":28}')
echo $MEMBER_RESPONSE
MEMBER_ID=$(echo $MEMBER_RESPONSE | grep -o '"member_id":[0-9]*' | grep -o '[0-9]*')

echo ""
echo "2. Creating a book..."
BOOK_RESPONSE=$(curl -s -X POST $BASE_URL/books -H "Content-Type: application/json" -d '{"title":"The Great Gatsby","author":"F. Scott Fitzgerald","isbn":"978-0743273565","category":"Fiction","rating":4.5}')
echo $BOOK_RESPONSE
BOOK_ID=$(echo $BOOK_RESPONSE | grep -o '"book_id":[0-9]*' | grep -o '[0-9]*')

echo ""
echo "3. Borrowing the book..."
BORROW_RESPONSE=$(curl -s -X POST $BASE_URL/borrow -H "Content-Type: application/json" -d "{\"member_id\":$MEMBER_ID,\"book_id\":$BOOK_ID}")
echo $BORROW_RESPONSE

echo ""
echo "4. Listing borrowed books..."
curl -s -X GET $BASE_URL/borrowed | head -c 200
echo "..."

echo ""
echo "5. Getting borrowing history..."
curl -s -X GET $BASE_URL/history/$MEMBER_ID | head -c 200
echo "..."

echo ""
echo "6. Searching books..."
curl -s -X GET "$BASE_URL/books/search?q=Gatsby&include_analytics=true" | head -c 200
echo "..."

echo ""
echo "7. Creating a reservation..."
RESERVATION_RESPONSE=$(curl -s -X POST $BASE_URL/reservations -H "Content-Type: application/json" -d "{\"member_id\":$MEMBER_ID,\"book_id\":$BOOK_ID,\"reservation_type\":\"premium\",\"fee_paid\":5.00}")
echo $RESERVATION_RESPONSE | head -c 200
echo "..."

echo ""
echo "8. Returning the book..."
RETURN_RESPONSE=$(curl -s -X POST $BASE_URL/return -H "Content-Type: application/json" -d "{\"member_id\":$MEMBER_ID,\"book_id\":$BOOK_ID}")
echo $RETURN_RESPONSE

echo ""
echo "9. Getting overdue books..."
curl -s -X GET $BASE_URL/overdue | head -c 200
echo "..."

echo ""
echo "✅ API testing completed!"
echo ""
echo "🌐 Web Interface: http://localhost:3000"
echo "📚 API Documentation: See README.md"
