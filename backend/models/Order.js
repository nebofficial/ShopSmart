const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    address: {
        name: String,
        phone: String,
        street: String,
        city: String,
        pincode: String
    },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    status: {
        type: String,
        enum: ['Pending', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 40 },
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date }
});

module.exports = mongoose.model('Order', orderSchema);
