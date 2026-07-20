const { Rental, Product } = require('../config/db');
const emailService = require('../services/emailService');

// @desc    Create a new rental transaction
// @route   POST /api/rentals
// @access  Private
const createRental = async (req, res) => {
  try {
    const { items, deliveryAddress, deliveryDate } = req.body;
    // items: Array of { productId, tenure }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No products selected for rental' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    const createdRentals = [];

    for (const item of items) {
      const { productId, tenure } = item;

      // 1. Fetch product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${productId} not found` });
      }

      if (product.stock <= 0) {
        return res.status(400).json({ message: `Product '${product.title}' is out of stock` });
      }

      // 2. Compute date boundaries
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + Number(tenure));

      // 3. Financial calculations
      const monthlyCost = product.monthlyRent;
      const depositAmount = product.securityDeposit;
      const totalAmount = (monthlyCost * Number(tenure)) + depositAmount;

      // 4. Create Rental record
      const rental = await Rental.create({
        userId: req.user._id,
        productId: productId,
        tenure: Number(tenure),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalAmount: totalAmount,
        depositAmount: depositAmount,
        status: 'active', // Direct activation after paid checkout
        deliveryAddress: deliveryAddress,
        deliveryDate: deliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days default
        paymentStatus: 'paid'
      });

      // 5. Decrement inventory stock
      await Product.findByIdAndUpdate(productId, {
        stock: product.stock - 1,
        availability: product.stock - 1 > 0
      });

      // Attach product metadata for client convenience
      rental.product = product;
      createdRentals.push(rental);
    }

    // Send Rental Confirmation Email asynchronously
    emailService.sendRentalConfirmationEmail(req.user.email, req.user.name, createdRentals, deliveryAddress);

    res.status(201).json(createdRentals);
  } catch (error) {
    console.error('Create rental failed:', error);
    res.status(500).json({ message: 'Server error placing rental' });
  }
};

// @desc    Get user specific rentals
// @route   GET /api/rentals/my
// @access  Private
const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ userId: req.user._id });
    
    // Simulating populate('productId')
    const populated = [];
    for (const rental of rentals) {
      const product = await Product.findById(rental.productId);
      populated.push({
        ...rental,
        product: product || { title: 'Unknown Product', images: [], monthlyRent: 0 }
      });
    }

    res.json(populated);
  } catch (error) {
    console.error('Fetch user rentals failed:', error);
    res.status(500).json({ message: 'Server error loading rentals' });
  }
};

// @desc    Extend active rental duration
// @route   PUT /api/rentals/extend
// @access  Private
const extendRental = async (req, res) => {
  try {
    const { rentalId, extraMonths } = req.body;

    if (!rentalId || !extraMonths) {
      return res.status(400).json({ message: 'Rental ID and additional months required' });
    }

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental transaction not found' });
    }

    if (rental.userId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to extend this rental' });
    }

    // 1. Calculate new endDate
    const currentEnd = new Date(rental.endDate);
    currentEnd.setMonth(currentEnd.getMonth() + Number(extraMonths));

    // 2. Adjust financial totals
    const product = await Product.findById(rental.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product associated with rental not found' });
    }

    const additionalCost = product.monthlyRent * Number(extraMonths);
    const updatedTotal = rental.totalAmount + additionalCost;
    const updatedTenure = rental.tenure + Number(extraMonths);

    const updated = await Rental.findByIdAndUpdate(rentalId, {
      tenure: updatedTenure,
      endDate: currentEnd.toISOString(),
      totalAmount: updatedTotal
    });

    res.json(updated);
  } catch (error) {
    console.error('Extend rental failed:', error);
    res.status(500).json({ message: 'Server error extending rental' });
  }
};

// @desc    Initiate return of a rented item
// @route   PUT /api/rentals/return
// @access  Private
const returnRental = async (req, res) => {
  try {
    const { rentalId } = req.body;

    if (!rentalId) {
      return res.status(400).json({ message: 'Rental ID required' });
    }

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental transaction not found' });
    }

    if (rental.userId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to return this rental' });
    }

    // Update rental status to completed (or scheduled pickup)
    const updated = await Rental.findByIdAndUpdate(rentalId, {
      status: 'completed',
      endDate: new Date().toISOString() // Marked returned today
    });

    // Restore product stock level
    const product = await Product.findById(rental.productId);
    if (product) {
      await Product.findByIdAndUpdate(rental.productId, {
        stock: product.stock + 1,
        availability: true
      });
    }

    res.json({ message: 'Return logged, pickup scheduled', rental: updated });
  } catch (error) {
    console.error('Return rental failed:', error);
    res.status(500).json({ message: 'Server error processing return' });
  }
};

// @desc    Get all rentals (Admin analytics)
// @route   GET /api/rentals
// @access  Private (Admin or Vendor)
const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find();

    const populated = [];
    for (const rental of rentals) {
      const product = await Product.findById(rental.productId);
      const user = await Rental.findById(rental.userId); // fetch user
      populated.push({
        ...rental,
        product: product || { title: 'Unknown Item', images: [], monthlyRent: 0 },
        userName: user ? user.name : 'Customer'
      });
    }

    res.json(populated);
  } catch (error) {
    console.error('Fetch all rentals failed:', error);
    res.status(500).json({ message: 'Server error retrieving analytics logs' });
  }
};

module.exports = {
  createRental,
  getMyRentals,
  extendRental,
  returnRental,
  getAllRentals
};
