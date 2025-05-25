// Upvote.model.js (Para bares)
const mongoose = require('mongoose');

const UpvoteSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bar: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bar', 
    required: true 
  }
}, { timestamps: true });

// Evita upvotes duplicados
UpvoteSchema.index({ user: 1, bar: 1 }, { unique: true });

module.exports = mongoose.model('Upvote', UpvoteSchema);