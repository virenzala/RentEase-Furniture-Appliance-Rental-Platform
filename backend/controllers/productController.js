const { Product } = require('../config/db');

// @desc    Get all products (with rich filtering & search)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, city, search, minRent, maxRent, sort } = req.query;

    let products = await Product.find();

    if (!Array.isArray(products)) {
      products = [];
    }

    // 1. Filter by category
    if (category && category !== 'all') {
      products = products.filter(p => p && p.category && p.category.toLowerCase() === category.toLowerCase());
    }

    // 2. Filter by city
    if (city && city !== 'all') {
      products = products.filter(p => p && p.city && p.city.toLowerCase() === city.toLowerCase());
    }

    // 3. Keyword Search (title & description)
    if (search) {
      const term = search.toLowerCase();
      products = products.filter(p => 
        p && ((p.title && p.title.toLowerCase().includes(term)) || 
        (p.description && p.description.toLowerCase().includes(term)))
      );
    }

    // 4. Rent Range Filter
    if (minRent) {
      products = products.filter(p => p && Number(p.monthlyRent || 0) >= Number(minRent));
    }
    if (maxRent) {
      products = products.filter(p => p && Number(p.monthlyRent || 0) <= Number(maxRent));
    }

    // 5. Sorting
    if (sort) {
      if (sort === 'price-asc') {
        products.sort((a, b) => (a.monthlyRent || 0) - (b.monthlyRent || 0));
      } else if (sort === 'price-desc') {
        products.sort((a, b) => (b.monthlyRent || 0) - (a.monthlyRent || 0));
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
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

    const DEFAULT_CATEGORY_IMAGES = {
      furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      appliances: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      electronics: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80'
    };
    const catLower = (category || '').toLowerCase();
    const fallbackImg = catLower.includes('appliance') 
      ? DEFAULT_CATEGORY_IMAGES.appliances 
      : catLower.includes('electronic') 
        ? DEFAULT_CATEGORY_IMAGES.electronics 
        : DEFAULT_CATEGORY_IMAGES.furniture;

    const finalImages = (Array.isArray(images) && images.length > 0 && images[0] && images[0].trim() !== '') 
      ? images 
      : [fallbackImg];

    const newProduct = await Product.create({
      title,
      category,
      description: description || '',
      monthlyRent: Number(monthlyRent),
      securityDeposit: Number(securityDeposit),
      images: finalImages,
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

const supabase = require('../config/supabase');

// @desc    Upload a product image to Supabase Storage
// @route   POST /api/products/upload-image
// @access  Private (Admin or Vendor)
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided for upload' });
    }

    if (!supabase) {
      return res.status(500).json({ message: 'Supabase storage is not configured' });
    }

    const bucketName = 'product-images';

    // 1. Ensure bucket exists and is public
    try {
      const { data: buckets, error: getError } = await supabase.storage.listBuckets();
      if (!getError) {
        const exists = buckets.some(b => b.name === bucketName);
        if (!exists) {
          console.log(`🔄 Creating public bucket '${bucketName}' in Supabase...`);
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
            fileSizeLimit: 5242880 // 5MB
          });
          if (createError) throw createError;
        }
      }
    } catch (e) {
      console.warn('Bucket auto-creation check bypassed:', e.message);
    }

    // 2. Generate unique file name
    const fileExt = req.file.originalname.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // 3. Upload file buffer
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ message: `Upload failed: ${error.message}` });
    }

    // 4. Resolve public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    res.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Image upload failed:', error);
    res.status(500).json({ message: 'Server error uploading product image' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
};
