const mongoose = require("mongoose");

const BarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phonenumber: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  image: {
    type: String
  },
  //cada bar está asociado a un dueño, si no hay dueño lo ponemos con el admin
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetail',
    required: true
  },
  // descripcion del bar 
  description: {
    type: String,
    required: true
  },
}, { timestamps: true });

const Bar = mongoose.model("Bar", BarSchema);

module.exports = Bar;
