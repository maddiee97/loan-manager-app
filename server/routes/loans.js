// server/routes/loans.js (COPY ALL OF THIS)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const { addWeeks, addMonths } = require('date-fns');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { borrowerId, loanSubject, principalAmount, interestRate, loanTerm, paymentSchedule, issueDate } = req.body;
    const installments = [];
    const startDate = new Date(issueDate || Date.now());
    const totalInterest = principalAmount * (interestRate / 100) * loanTerm;
    const amountPerInstallment = (principalAmount + totalInterest) / loanTerm;

    for (let i = 1; i <= loanTerm; i++) {
      let dueDate;
      if (paymentSchedule === 'Weekly') {
        dueDate = addWeeks(startDate, i);
      } else {
        dueDate = addMonths(startDate, i);
      }
      installments.push({
        installmentNumber: i,
        dueDate,
        amountDue: amountPerInstallment,
        status: 'Pending',
      });
    }

    const newLoan = new Loan({
      user: req.user.id,
      borrower: borrowerId,
      loanSubject,
      principalAmount,
      interestRate,
      loanTerm,
      paymentSchedule,
      issueDate: startDate,
      installments,
    });

    const loan = await newLoan.save();
    res.status(201).json(loan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id })
      .populate('borrower', ['name', 'contactInfo'])
      .sort({ issueDate: -1 });
    res.json(loans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Payment.deleteMany({ loan: req.params.id, user: req.user.id });
    const loan = await Loan.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!loan) {
      return res.status(444).json({ msg: 'Loan not found' });
    }
    res.json({ msg: 'Loan and associated payments removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:loanId/installments/:installmentId', authMiddleware, async (req, res) => {
  try {
    const { amountPaid } = req.body;

    // Find the parent loan
    const loan = await Loan.findOne({ _id: req.params.loanId, user: req.user.id });
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    // Find the specific installment within that loan's array
    const installment = loan.installments.id(req.params.installmentId);
    if (!installment) {
      return res.status(404).json({ msg: 'Installment not found' });
    }

    // Update the installment's details
    installment.status = 'Paid';
    installment.amountPaid = amountPaid;
    installment.datePaid = new Date();

    // Check if all installments are now paid to mark the loan as 'Completed'
    const allPaid = loan.installments.every(inst => inst.status === 'Paid');
    if (allPaid) {
      loan.status = 'Completed';
    }

    // Save the changes to the parent loan document
    await loan.save();

    // Send the fully updated loan back
    res.json(loan);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { loanSubject, principalAmount, interestRate, loanTerm, paymentSchedule, status } = req.body;

    // Build an object with the fields to update
    const loanFields = {};
    if (loanSubject) loanFields.loanSubject = loanSubject;
    if (principalAmount) loanFields.principalAmount = principalAmount;
    if (interestRate) loanFields.interestRate = interestRate;
    if (loanTerm) loanFields.loanTerm = loanTerm;
    if (paymentSchedule) loanFields.paymentSchedule = paymentSchedule;
    if (status) loanFields.status = status;

    let loan = await Loan.findOne({ _id: req.params.id, user: req.user.id });

    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    // Note: This simple update does not regenerate installments.
    // A more complex version could, but that would erase payment history.

    loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { $set: loanFields },
      { new: true }
    ).populate('borrower', ['name', 'contactInfo']);
    
    res.json(loan);
  } catch (err)
 {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/update-statuses', authMiddleware, async (req, res) => {
  try {
    // We now check all loans that are not yet 'Completed'
    const loansToScan = await Loan.find({ 
      user: req.user.id, 
      status: { $in: ['Active', 'Overdue'] } 
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the start of today for comparison

    let updatedCount = 0;

    for (const loan of loansToScan) {
      const firstPendingInstallment = loan.installments.find(inst => inst.status === 'Pending');

      if (!firstPendingInstallment) {
        // If there are no pending installments, mark as completed
        loan.status = 'Completed';
        await loan.save();
        updatedCount++;
        continue; // Move to the next loan
      }

      const isPastDue = new Date(firstPendingInstallment.dueDate) < today;

      // Logic to change status
      if (isPastDue && loan.status === 'Active') {
        // If the first pending payment is past due and the loan is Active, mark it Overdue
        loan.status = 'Overdue';
        await loan.save();
        updatedCount++;
      } else if (!isPastDue && loan.status === 'Overdue') {
        // If the loan is Overdue, but the next payment isn't due yet, it means they've caught up. Mark it Active.
        loan.status = 'Active';
        await loan.save();
        updatedCount++;
      }
    }

    res.json({ msg: `${updatedCount} loan statuses updated.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;