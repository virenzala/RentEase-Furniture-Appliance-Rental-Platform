const { Product } = require('../config/db');

// @desc    Get all products (with rich filtering & search)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, city, search, minRent, maxRent, sort } = req.query;

    let products = await Product.find();

    // 1. Filter by category
    if (category && category !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // 2. Filter by city
    if (city && city !== 'all') {
      products = products.filter(p => p.city.toLowerCase() === city.toLowerCase());
    }

    // 3. Keyword Search (title & description)
    if (search) {
      const term = search.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // 4. Rent Range Filter
    if (minRent) {
      products = products.filter(p => p.monthlyRent >= Number(minRent));
    }
    if (maxRent) {
      products = products.filter(p => p.monthlyRent <= Number(maxRent));
    }

    // 5. Sorting
    if (sort) {
      if (sort === 'price-asc') {
        products.sort((a, b) => a.monthlyRent - b.monthlyRent);
      } else if (sort === 'price-desc') {
        products.sort((a, b) => b.monthlyRent - a.monthlyRent);
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    res.json(products);
  } catch (error) {
    console.error('Fetch products failed:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Fetch product by ID failed:', error);
    res.status(500).json({ message: 'Server error fetching product details' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin or Vendor)
const createProduct = async (req, res) => {
  try {
    const { title, category, description, monthlyRent, securityDeposit, images, tenureOptions, stock, city } = req.body;

    if (!title || !category || !monthlyRent || !securityDeposit || !city) {
      return res.status(400).json({ message: 'Please enter all required fields: title, category, monthlyRent, securityDeposit, city' });
    }

    const newProduct = await Product.create({
      title,
      category,
      description: description || '',
      monthlyRent: Number(monthlyRent),
      securityDeposit: Number(securityDeposit),
      images: images || [],
      tenureOptions: tenureOptions || [3, 6, 12, 24],
      stock: stock !== undefined ? Number(stock) : 5,
      city: city,
      availability: true,
      vendorId: req.user._id
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product failed:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin or Vendor)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership or admin privileges
    if (product.vendorId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update product failed:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin or Vendor)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership or admin privileges
    if (product.vendorId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error('Delete product failed:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
