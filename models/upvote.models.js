const mongoose = require('mongoose');

const UpvoteSchema = mongoose.Schema({
  place_id: {
    type: String,
    required: true
  },
  user: {
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

const Upvote = mongoose.model('Upvote', UpvoteSchema);
module.exports = Upvote;