// Comment.model.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  review: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Review', 
    required: true 
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
