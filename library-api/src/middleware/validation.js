const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      message: firstError.msg
    });
  }
  next();
};

// Member validation rules
const validateCreateMember = [
  body('member_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Member ID must be a positive integer'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('age')
    .isInt({ min: 12, max: 120 })
    .withMessage('Age must be between 12 and 120'),
  handleValidationErrors
];

const validateMemberId = [
  param('member_id')
    .isInt({ min: 1 })
    .withMessage('Member ID must be a positive integer'),
  handleValidationErrors
];

// Book validation rules
const validateCreateBook = [
  body('book_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Book ID must be a positive integer'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('isbn')
    .optional()
    .isLength({ min: 10, max: 17 })
    .withMessage('ISBN must be between 10 and 17 characters'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('pages')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Pages must be between 0 and 10000'),
  handleValidationErrors
];

const validateBookId = [
  param('book_id')
    .isInt({ min: 1 })
    .withMessage('Book ID must be a positive integer'),
  handleValidationErrors
];

// Transaction validation rules
const validateBorrowBook = [
  body('member_id')
    .isInt({ min: 1 })
    .withMessage('Member ID must be a positive integer'),
  body('book_id')
    .isInt({ min: 1 })
    .withMessage('Book ID must be a positive integer'),
  handleValidationErrors
];

const validateReturnBook = [
  body('member_id')
    .isInt({ min: 1 })
    .withMessage('Member ID must be a positive integer'),
  body('book_id')
    .isInt({ min: 1 })
    .withMessage('Book ID must be a positive integer'),
  handleValidationErrors
];

// Reservation validation rules
const validateCreateReservation = [
  body('member_id')
    .isInt({ min: 1 })
    .withMessage('Member ID must be a positive integer'),
  body('book_id')
    .isInt({ min: 1 })
    .withMessage('Book ID must be a positive integer'),
  body('reservation_type')
    .optional()
    .isIn(['standard', 'premium', 'group'])
    .withMessage('Reservation type must be standard, premium, or group'),
  body('preferred_pickup_date')
    .optional()
    .isISO8601()
    .withMessage('Preferred pickup date must be a valid ISO 8601 date'),
  body('max_wait_days')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Max wait days must be between 1 and 30'),
  body('fee_paid')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Fee paid must be between 0 and 100'),
  handleValidationErrors
];

// Search validation rules
const validateSearchQuery = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  query('author')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  query('published_after')
    .optional()
    .isISO8601()
    .withMessage('Published after date must be a valid ISO 8601 date'),
  query('published_before')
    .optional()
    .isISO8601()
    .withMessage('Published before date must be a valid ISO 8601 date'),
  query('min_rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Min rating must be between 0 and 5'),
  query('max_rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Max rating must be between 0 and 5'),
  query('availability')
    .optional()
    .isIn(['available', 'borrowed', 'reserved', 'all'])
    .withMessage('Availability must be available, borrowed, reserved, or all'),
  query('sort_by')
    .optional()
    .isIn(['title', 'author', 'published_date', 'rating', 'popularity', 'relevance'])
    .withMessage('Sort by must be title, author, published_date, rating, popularity, or relevance'),
  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('include_analytics')
    .optional()
    .isBoolean()
    .withMessage('Include analytics must be a boolean'),
  query('member_preferences')
    .optional()
    .isBoolean()
    .withMessage('Member preferences must be a boolean'),
  query('borrowing_trends')
    .optional()
    .isBoolean()
    .withMessage('Borrowing trends must be a boolean'),
  handleValidationErrors
];

// Date range validation
const validateDateRange = (req, res, next) => {
  const { published_after, published_before } = req.query;
  
  if (published_after && published_before) {
    const afterDate = new Date(published_after);
    const beforeDate = new Date(published_before);
    
    if (afterDate >= beforeDate) {
      return res.status(400).json({
        error: 'invalid_query_parameters',
        message: 'Invalid date range: published_after cannot be later than published_before',
        details: {
          invalid_params: ['published_after', 'published_before'],
          suggested_corrections: {
            published_after: '2020-01-01',
            published_before: '2023-12-31'
          }
        }
      });
    }
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  validateCreateMember,
  validateMemberId,
  validateCreateBook,
  validateBookId,
  validateBorrowBook,
  validateReturnBook,
  validateCreateReservation,
  validateSearchQuery,
  validateDateRange
};
