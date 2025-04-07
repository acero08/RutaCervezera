const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDetail",  
    required: true
  },
  bar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bar", 
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
