const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all products (with filters, sort, search, pagination)
router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, inStock, sort, search, page = 1, limit = 12, featured, bestSeller } = req.query;
        let query = {};

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (inStock === 'true') query.stock = { $gt: 0 };
        if (featured === 'true') query.featured = true;
        if (bestSeller === 'true') query.bestSeller = true;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        else if (sort === 'price_desc') sortOption = { price: -1 };
        else if (sort === 'popular') sortOption = { bestSeller: -1 };
        else if (sort === 'newest') sortOption = { createdAt: -1 };

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sortOption)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            products,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Create product
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const productData = { ...req.body };
        if (req.file) {
            productData.image = `/uploads/${req.file.filename}`;
        }
        const product = await Product.create(productData);

        // Update category product count
        await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Update product
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        // If category changed, update counts
        if (updateData.category && updateData.category !== product.category.toString()) {
            await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
            await Category.findByIdAndUpdate(updateData.category, { $inc: { productCount: 1 } });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('category', 'name');
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Delete product
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
