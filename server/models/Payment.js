// server/models/Payment.js (Updated)
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  // --- NEW FIELD ---
  installmentNumber: { type: Number, required: true },
});

module.exports = mongoose.model('Payment', PaymentSchema);