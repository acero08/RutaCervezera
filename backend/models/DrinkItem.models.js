const mongoose = require('mongoose');
const BaseItem = require('./BaseItem.models.js');

const drinkItemSchema = new mongoose.Schema({
  volume: {
    type: Number,
    min: 0,
    required: true
  },
  category: {
    type: String,
    enum: ['refresco', 'agua', 'jugo', 'cafe', 'te', 'energetica'],
    required: true
  },
  servingTemperature: {
    type: String,
    enum: ['frio', 'ambiente', 'caliente'],
    required: true
  },
  isSugarFree: {
    type: Boolean,
    default: false
  },
  ingredients: [{
    type: String,
    trim: true
  }]
});

module.exports = BaseItem.discriminator('DrinkItem', drinkItemSchema);