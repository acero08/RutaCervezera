const mongoose = require("mongoose");

const EventsSchema = new mongoose.Schema({
  bar: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Bar"
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  location: { type: String },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Events", EventsSchema);