const mongoose = require('mongoose');
const BaseItem = require('./BaseItem.models.js');

const alcoholicItemSchema = new mongoose.Schema({
    alcoholPercentage: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    volume: {
        type: Number,
        min: 0,
        required: true
    },
    category: {
        type: String,
        enum: ['cerveza', 'vino', 'coctel', 'licor'],
        required: true
    },
    origin: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true,
        required: true
    }
});

module.exports = BaseItem.discriminator('AlcoholicItem', alcoholicItemSchema);
