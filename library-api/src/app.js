const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

const memberRoutes = require('./routes/members');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrow');
const reservationRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS
app.use(cors());

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('public'));

// Routes
app.use('/api/members', memberRoutes);
app.use('/api/books', bookRoutes);
app.use('/api', borrowRoutes);
app.use('/api', reservationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Library API server running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Members API: http://localhost:${PORT}/api/members`);
  console.log(`📖 Books API: http://localhost:${PORT}/api/books`);
  console.log(`📚 Borrowing API: http://localhost:${PORT}/api/borrow`);
  console.log(`🎫 Reservations API: http://localhost:${PORT}/api/reservations`);
});

module.exports = app;
