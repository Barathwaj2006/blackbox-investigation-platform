const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { memoryStore } = require('../utils/memoryStore');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      let user = memoryStore.users.find(u => u.username === username);
      if (user && user.password && user.password !== password) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      if (!user) {
        user = {
          _id: 'u_' + Date.now(),
          username,
          password: password || 'demo',
          name: username.charAt(0).toUpperCase() + username.slice(1),
          role: username === 'admin' ? 'Admin' : (username === 'reviewer' ? 'Reviewer' : 'Investigator')
        };
        memoryStore.users.push(user);
      }
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    }
    
    // Mongoose connected path
    let user = await User.findOne({ username });
    if (!user && process.env.NODE_ENV !== 'production') {
       user = await User.create({
         username,
         password: password || 'demo',
         name: username.charAt(0).toUpperCase() + username.slice(1),
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
