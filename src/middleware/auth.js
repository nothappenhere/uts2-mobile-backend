const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan user data di req
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
  next();
};

module.exports = { verifyToken, isAdmin };