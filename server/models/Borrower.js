// server/models/Borrower.js
const mongoose = require('mongoose');

const BorrowerSchema = new mongoose.Schema({
  // This is the most important field. It links this borrower to a specific user.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This refers to our 'User' model
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from the beginning and end
  },
  contactInfo: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Borrower', BorrowerSchema);