// server/routes/stats.js (Corrected Interest Logic)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Loan = require('../models/Loan');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id });

    if (!loans) {
      return res.json({ totalPrincipal: 0, totalInterest: 0, totalCollectibles: 0, activeLoans: 0, overdueLoans: 0 });
    }

    const totalPrincipal = loans.reduce((acc, loan) => acc + (loan.principalAmount || 0), 0);

    // --- THIS IS THE NEW LOGIC ---
    const totalInterest = loans.reduce((acc, loan) => {
      const principal = loan.principalAmount || 0;
      const rate = loan.interestRate || 0;
      const term = loan.loanTerm || 0;
      // Interest per period * number of periods
      const interestForThisLoan = (principal * (rate / 100)) * term;
      return acc + interestForThisLoan;
    }, 0);
    // -----------------------------

    const stats = {
      totalPrincipal,
      totalInterest,
      totalCollectibles: totalPrincipal + totalInterest,
      activeLoans: loans.filter(loan => loan.status === 'Active').length,
      overdueLoans: loans.filter(loan => loan.status === 'Overdue').length,
    };

    res.json(stats);
  } catch (err) {
    console.error("Error in /api/stats:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;