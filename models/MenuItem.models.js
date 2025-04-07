const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  bar: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Bar"
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
  },
  itemType: {
    type: String,
    enum: ["food", "drink"],
    required: true
  },
  foodDetails: {
    isVegetarian: {
      type: Boolean,
      default: false
    },
    calories: {
      type: Number,
      min: 0
    }
  },
  drinkDetails: {
    isAlcoholic: {
      type: Boolean,
      required: true
    },
    alcoholPercentage: {
      type: Number,
      min: 0,
      max: 100
      
    },
    volume: {
      type: Number, 
      min: 0
    }
  }
}, {
  timestamps: true,
  discriminatorKey: "itemType"
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
