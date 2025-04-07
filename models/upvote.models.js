const mongoose = require('mongoose');

const UpvoteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bar_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bar',
    required: true
  }
}, {
  timestamps: true
});

// Nomas 1 voto por persona a un lugar
UpvoteSchema.index({ user_id: 1, place_id: 1 }, { unique: true });

module.exports = mongoose.model('Upvote', UpvoteSchema);
