// server/routes/borrowers.js (Complete and Corrected)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Borrower = require('../models/Borrower');
const Loan = require('../models/Loan');

// @route   POST api/borrowers
// @desc    Create a new borrower
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, contactInfo } = req.body;
    const newBorrower = new Borrower({
      name,
      contactInfo,
      user: req.user.id,
    });
    const borrower = await newBorrower.save();
    res.status(201).json(borrower);
  } catch (err) {
    console.error("Error in POST /api/borrowers:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/borrowers
// @desc    Get all borrowers for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const borrowers = await Borrower.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(borrowers);
  } catch (err) {
    console.error("Error in GET /api/borrowers:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/borrowers/:id
// @desc    Delete a borrower
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const loans = await Loan.find({ borrower: req.params.id, user: req.user.id });
    if (loans.length > 0) {
      return res.status(400).json({ msg: 'Cannot delete borrower with active loans. Please delete their loans first.' });
    }
    const borrower = await Borrower.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!borrower) {
      return res.status(404).json({ msg: 'Borrower not found' });
    }
    res.json({ msg: 'Borrower removed' });
  } catch (err) {
    console.error("Error in DELETE /api/borrowers/:id:", err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, contactInfo } = req.body;

    const borrowerFields = {};
    if (name) borrowerFields.name = name;
    if (contactInfo !== undefined) borrowerFields.contactInfo = contactInfo; // Allow empty string

    let borrower = await Borrower.findOne({ _id: req.params.id, user: req.user.id });

    if (!borrower) {
      return res.status(404).json({ msg: 'Borrower not found' });
    }

    borrower = await Borrower.findByIdAndUpdate(
      req.params.id,
      { $set: borrowerFields },
      { new: true }
    );

    res.json(borrower);
  } catch (err) {
    console.error("Error updating borrower:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;