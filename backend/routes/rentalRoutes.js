const express = require('express');
const router = express.Router();
const {
  createRental,
  getMyRentals,
  extendRental,
  returnRental,
  getAllRentals
} = require('../controllers/rentalController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createRental)
  .get(protect, authorize('vendor', 'admin'), getAllRentals);

router.get('/my', protect, getMyRentals);
router.put('/extend', protect, extendRental);
router.put('/return', protect, returnRental);

module.exports = router;
