const mongoose = require('mongoose');

const BarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  openingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  priceRange: {
    type: String,
    enum: ['low', 'medium', 'high', 'luxury'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['bar', 'pub', 'cocktail_bar', 'sports_bar', 'lounge', 'nightclub', 'restaurant_bar'],
    default: 'bar'
  },
  specialties: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetail',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Campos para reviews y ratings
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  // Campo para contar vistas/visitas
  viewCount: {
    type: Number,
    default: 0
  },
  // Ubicación geográfica (opcional)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitud, latitud]
      default: [0, 0]
    }
  },
  // Amenidades/servicios
  amenities: [{
    type: String,
    enum: [
      'wifi', 'parking', 'outdoor_seating', 'live_music',
      'karaoke', 'pool_table', 'darts', 'sports_tv',
      'food_service', 'happy_hour', 'vip_area',
      'accessibility', 'smoking_area', 'dance_floor'
    ]
  }],
  // Horarios especiales (eventos, etc.)
  specialEvents: [{
    title: String,
    description: String,
    date: Date,
    startTime: String,
    endTime: String,
    isRecurring: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Índices para mejorar búsquedas
BarSchema.index({ city: 1, category: 1 });
BarSchema.index({ name: 'text', description: 'text' });
BarSchema.index({ location: '2dsphere' });
BarSchema.index({ owner: 1 });

// Middleware para actualizar el contador de reviews cuando se calcula el promedio
BarSchema.methods.updateRating = function (newRating, isNewReview = true) {
  if (isNewReview) {
    const totalRating = (this.averageRating * this.reviewCount) + newRating;
    this.reviewCount += 1;
    this.averageRating = totalRating / this.reviewCount;
  } else {
    // Si es una actualización de review existente, necesitarás más lógica aquí
    // Por simplicidad, este ejemplo asume que siempre son nuevas reviews
  }
  return this.save();
};

// Método para incrementar el contador de vistas
BarSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

const Bar = mongoose.model('Bar', BarSchema);
module.exports = Bar;