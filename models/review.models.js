const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
  place_id: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
