// server/models/Loan.js (Major Overhaul)
const mongoose = require('mongoose');

// This is a "sub-document" schema. It defines the structure of each payment installment.
const InstallmentSchema = new mongoose.Schema({
  installmentNumber: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  amountDue: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
  amountPaid: { type: Number },
  datePaid: { type: Date },
});

const LoanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  loanSubject: { type: String, required: true, trim: true },
  principalAmount: { type: Number, required: true },
  interestRate: { type: Number, required: true }, // This is now the rate PER PERIOD
  issueDate: { type: Date, default: Date.now },
  loanTerm: { type: Number, required: true },
  paymentSchedule: { type: String, enum: ['Weekly', 'Monthly'], required: true },
  status: { type: String, enum: ['Active', 'Overdue', 'Completed'], default: 'Active' },

  // The old payment fields are replaced by this detailed array:
  installments: [InstallmentSchema],
});

module.exports = mongoose.model('Loan', LoanSchema);