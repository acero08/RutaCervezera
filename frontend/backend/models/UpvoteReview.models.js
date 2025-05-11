const mongoose = require('mongoose');

const UpvoteReviewSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    review_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true }
  });
  
  const UpvoteReview = mongoose.model('UpvoteReview', UpvoteReviewSchema);
  module.exports = UpvoteReview;
  