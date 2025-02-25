const adminAuth = (req, res, next) => {
    if (req.user.userType !== 'Admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }
    next();
  };
  
  module.exports = adminAuth;