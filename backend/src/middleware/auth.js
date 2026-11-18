const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and attach user to req.user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * Restrict access to specific roles
 * @param {...string} roles - allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. No user session.' });
    }
    const userRole = req.user.role;
    const effectiveRoles = [userRole];
    if (['Owner', 'Manager', 'owner', 'manager', 'management'].includes(userRole)) {
      effectiveRoles.push('management', 'accounting_staff', 'hr_staff');
    }
    const hasRole = roles.some((r) => effectiveRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
