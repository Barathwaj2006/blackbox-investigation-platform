const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Demo login fast path
    let user = await User.findOne({ username });
    if (!user && process.env.NODE_ENV !== 'production') {
       // Auto-create demo users if they don't exist
       user = await User.create({
         username,
         password: password || 'demo',
         name: username,
         role: username === 'admin' ? 'Admin' : (username === 'reviewer' ? 'Reviewer' : 'Investigator')
       });
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch && process.env.NODE_ENV !== 'production' && password === 'demo') {
       // Demo override
    } else if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};
