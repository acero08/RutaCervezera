const mongoose = require('mongoose');

const baseItemSchema = new mongoose.Schema({
  bar: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Bar", 
    required: true 
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
    type: String 
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  // NUEVO: Referencia al usuario que creó el item
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetail',
    required: true
  }
}, { 
  timestamps: true,
  discriminatorKey: 'itemType' 
});

module.exports = mongoose.model('BaseItem', baseItemSchema);
