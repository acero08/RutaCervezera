// UpvoteReview.model.js (Para reseñas)
const mongoose = require('mongoose');

const UpvoteReviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  review: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Review', 
    required: true 
  }
}, { timestamps: true });

// Evita upvotes duplicados
UpvoteReviewSchema.index({ user: 1, review: 1 }, { unique: true });

module.exports = mongoose.model('UpvoteReview', UpvoteReviewSchema);