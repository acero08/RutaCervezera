// Review.model.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} no es un valor entero'
    }
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);