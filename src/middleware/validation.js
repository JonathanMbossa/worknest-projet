const { validationResult } = require('express-validator');

/**
 * Middleware de validation des données
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }
  
  next();
};

module.exports = validate;

