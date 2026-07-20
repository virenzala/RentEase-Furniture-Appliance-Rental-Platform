const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  uploadProductImage
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Multer Config for memory storage uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.route('/')
  .get(getProducts)
  .post(protect, authorize('vendor', 'admin'), createProduct);

router.post('/upload-image', protect, authorize('vendor', 'admin'), upload.single('image'), uploadProductImage);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('vendor', 'admin'), updateProduct)
  .delete(protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;
