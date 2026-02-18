const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    weight: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    nutrition: { type: String, default: '' },
    status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
