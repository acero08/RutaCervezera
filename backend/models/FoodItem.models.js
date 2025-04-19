const BaseItem = require('./BaseItem.models.js');
const mongoose = require('mongoose');


const foodItemSchema = new mongoose.Schema({
  isVegetarian: { 
    type: Boolean, 
    default: false 
  },
  hasGluten: { 
    type: Boolean, 
    default: false 
  },
  calories: { 
    type: Number, 
    min: 0 
  },
  category: {
    type: String,
    enum: ['entrada', 'plato_principal', 'postre', 'ensalada', 'guarnicion']
  }
});

module.exports = BaseItem.discriminator('FoodItem', foodItemSchema);