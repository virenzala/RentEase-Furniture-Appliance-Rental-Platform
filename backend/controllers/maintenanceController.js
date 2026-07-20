const { MaintenanceRequest, Rental, Product, User } = require('../config/db');
const emailService = require('../services/emailService');

// @desc    Create a new maintenance ticket
// @route   POST /api/maintenance
// @access  Private
const createRequest = async (req, res) => {
  try {
    const { rentalId, issue, priority } = req.body;

    if (!rentalId || !issue) {
      return res.status(400).json({ message: 'Please specify the rental item and issue description' });
    }

    // 1. Verify that rental exists and is owned by the user
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental reference not found' });
    }

    if (rental.userId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to request maintenance for this item' });
    }

    // 2. Create the ticket
    const ticket = await MaintenanceRequest.create({
      rentalId: rentalId,
      userId: req.user._id,
      issue: issue,
      priority: priority || 'medium', // 'low' | 'medium' | 'high'
      status: 'pending' // 'pending' | 'assigned' | 'resolved'
    });

    // Send Ticket Filed Email asynchronously
    (async () => {
      try {
        const product = await Product.findById(rental.productId);
        const productTitle = product ? product.title : 'Rented Item';
        emailService.sendMaintenanceTicketCreatedEmail(req.user.email, req.user.name, ticket, productTitle);
      } catch (err) {
        console.error('Failed to send maintenance ticket creation email:', err);
      }
    })();

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create maintenance request failed:', error);
    res.status(500).json({ message: 'Server error filing maintenance ticket' });
  }
};

// @desc    Get user's logged maintenance tickets
// @route   GET /api/maintenance/my
// @access  Private
const getMyRequests = async (req, res) => {
  try {
    const tickets = await MaintenanceRequest.find({ userId: req.user._id });

    // Populate rental product names
    const populated = [];
    for (const ticket of tickets) {
      const rental = await Rental.findById(ticket.rentalId);
      const product = rental ? await Product.findById(rental.productId) : null;
      
      populated.push({
        ...ticket,
        productTitle: product ? product.title : 'Rented Item',
        productImage: product && product.images ? product.images[0] : ''
      });
    }

    res.json(populated);
  } catch (error) {
    console.error('Fetch user tickets failed:', error);
    res.status(500).json({ message: 'Server error loading maintenance portal' });
  }
};

// @desc    Get all maintenance tickets (Admin dashboard)
// @route   GET /api/maintenance
// @access  Private (Admin or Vendor)
const getAllRequests = async (req, res) => {
  try {
    const tickets = await MaintenanceRequest.find();

    const populated = [];
    for (const ticket of tickets) {
      const rental = await Rental.findById(ticket.rentalId);
      const product = rental ? await Product.findById(rental.productId) : null;
      
      populated.push({
        ...ticket,
        productTitle: product ? product.title : 'Rented Item',
        productImage: product && product.images ? product.images[0] : '',
        userId: ticket.userId
      });
    }

    res.json(populated);
  } catch (error) {
    console.error('Fetch all tickets failed:', error);
    res.status(500).json({ message: 'Server error loading admin tickets database' });
  }
};

// @desc    Update ticket status
// @route   PUT /api/maintenance/:id
// @access  Private (Admin or Vendor)
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'pending' | 'assigned' | 'resolved'
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const ticket = await MaintenanceRequest.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Maintenance ticket not found' });
    }

    const updated = await MaintenanceRequest.findByIdAndUpdate(req.params.id, { status });

    // Send Status Update Email asynchronously
    (async () => {
      try {
        const user = await User.findById(ticket.userId);
        if (user) {
          const rental = await Rental.findById(ticket.rentalId);
          const product = rental ? await Product.findById(rental.productId) : null;
          const productTitle = product ? product.title : 'Rented Item';
          emailService.sendMaintenanceTicketStatusUpdateEmail(user.email, user.name, updated, productTitle, status);
        }
      } catch (err) {
        console.error('Failed to send status update email:', err);
      }
    })();

    res.json(updated);
  } catch (error) {
    console.error('Update ticket status failed:', error);
    res.status(500).json({ message: 'Server error updating ticket status' });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus
};
