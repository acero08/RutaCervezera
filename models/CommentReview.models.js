const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDetail', required: true },
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('CommentReview', CommentSchema);
module.exports = Comment;
