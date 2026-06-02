const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createRequest)
  .get(protect, authorize('vendor', 'admin'), getAllRequests);

router.get('/my', protect, getMyRequests);
router.put('/:id', protect, authorize('vendor', 'admin'), updateRequestStatus);

module.exports = router;
