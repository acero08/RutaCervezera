const mongoose = require('mongoose');
const BaseItem = require('./BaseItem.models.js');


const drinkItemSchema = new mongoose.Schema({
  isAlcoholic: { 
    type: Boolean, 
    required: true,
    default: false // Valor por defecto
  },
  alcoholPercentage: { 
    type: Number, 
    min: 0, 
    max: 100,
    required: function() { return this.isAlcoholic; } // Solo requerido si es alcohólico
  },
  volume: { 
    type: Number, 
    min: 0, 
    required: true 
  },
  category: {
    type: String,
    enum: ['cerveza', 'vino', 'coctel', 'licor', 'refresco', 'agua', 'jugo', 'cafe', 'te', 'energetica'],
    required: true
  },
  // Nuevo campo específico para no alcohólicas
  servingTemperature: {
    type: String,
    enum: ['frio', 'ambiente', 'caliente'],
    required: function() { return !this.isAlcoholic; }
  }
});

module.exports = BaseItem.discriminator('DrinkItem', drinkItemSchema);