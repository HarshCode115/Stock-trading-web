const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Stock validation
const validateStock = [
  body('symbol')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Symbol must be between 1 and 10 characters')
    .matches(/^[A-Z]+$/)
    .withMessage('Symbol must contain only uppercase letters'),
  
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
  
  body('currentPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Current price must be at least 0.01'),
  
  body('previousClose')
    .isFloat({ min: 0 })
    .withMessage('Previous close must be non-negative'),
  
  body('openPrice')
    .isFloat({ min: 0 })
    .withMessage('Open price must be non-negative'),
  
  body('dayHigh')
    .isFloat({ min: 0 })
    .withMessage('Day high must be non-negative'),
  
  body('dayLow')
    .isFloat({ min: 0 })
    .withMessage('Day low must be non-negative'),
  
  body('sector')
    .optional()
    .isIn([
      'Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer Goods',
      'Industrial', 'Real Estate', 'Utilities', 'Materials', 'Communication', 'Other'
    ])
    .withMessage('Invalid sector'),
  
  handleValidationErrors
];

// Transaction validation
const validateTransaction = [
  body('stock')
    .isMongoId()
    .withMessage('Invalid stock ID'),
  
  body('type')
    .isIn(['buy', 'sell'])
    .withMessage('Transaction type must be buy or sell'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be at least 0.01'),
  
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters'),
  
  handleValidationErrors
];

// Watchlist validation
const validateWatchlist = [
  body('stock')
    .isMongoId()
    .withMessage('Invalid stock ID'),
  
  body('notes')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Notes cannot exceed 100 characters'),
  
  body('alertPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Alert price must be non-negative'),
  
  body('alertType')
    .optional()
    .isIn(['above', 'below', 'none'])
    .withMessage('Alert type must be above, below, or none'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateStock,
  validateTransaction,
  validateWatchlist,
  handleValidationErrors
};
