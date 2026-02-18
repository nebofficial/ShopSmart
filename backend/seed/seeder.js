const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

const categories = [
    { name: 'Fruits', image: '🍎', productCount: 0 },
    { name: 'Vegetables', image: '🥬', productCount: 0 },
    { name: 'Dairy', image: '🥛', productCount: 0 },
    { name: 'Snacks', image: '🍪', productCount: 0 },
    { name: 'Drinks', image: '🥤', productCount: 0 },
    { name: 'Bakery', image: '🍞', productCount: 0 },
    { name: 'Meat', image: '🍗', productCount: 0 },
    { name: 'Household', image: '🧴', productCount: 0 }
];

const getProducts = (categoryMap) => [
    // Fruits
    { name: 'Fresh Apples', category: categoryMap['Fruits'], price: 120, stock: 50, weight: '1 kg', description: 'Crisp and juicy red apples sourced from Himachal orchards. Perfect for snacking or making pies.', nutrition: 'Calories: 95, Fiber: 4g, Vitamin C: 14%', featured: true, bestSeller: true, image: '' },
    { name: 'Organic Bananas', category: categoryMap['Fruits'], price: 45, stock: 80, weight: '1 dozen', description: 'Naturally ripened organic bananas. Rich in potassium and great for smoothies.', nutrition: 'Calories: 105, Potassium: 422mg, Fiber: 3g', featured: true, image: '' },
    { name: 'Mangoes (Alphonso)', category: categoryMap['Fruits'], price: 350, stock: 30, weight: '1 kg', description: 'Premium Alphonso mangoes from Ratnagiri. The king of fruits with unmatched sweetness.', nutrition: 'Calories: 99, Vitamin A: 25%, Vitamin C: 76%', bestSeller: true, image: '' },
    { name: 'Strawberries', category: categoryMap['Fruits'], price: 180, stock: 25, weight: '250 g', description: 'Fresh farm-picked strawberries. Sweet, juicy and perfect for desserts.', nutrition: 'Calories: 49, Vitamin C: 149%, Manganese: 29%', featured: true, image: '' },
    { name: 'Watermelon', category: categoryMap['Fruits'], price: 60, stock: 20, weight: '1 piece', description: 'Refreshing seedless watermelon. Perfect for summer hydration.', nutrition: 'Calories: 86, Vitamin A: 18%, Vitamin C: 21%', image: '' },

    // Vegetables
    { name: 'Fresh Tomatoes', category: categoryMap['Vegetables'], price: 40, stock: 100, weight: '1 kg', description: 'Farm-fresh red tomatoes. Essential for every Indian kitchen.', nutrition: 'Calories: 22, Vitamin C: 28%, Potassium: 292mg', bestSeller: true, image: '' },
    { name: 'Green Spinach', category: categoryMap['Vegetables'], price: 30, stock: 60, weight: '500 g', description: 'Organic baby spinach leaves. Packed with iron and nutrients.', nutrition: 'Calories: 23, Iron: 15%, Vitamin K: 181%', featured: true, image: '' },
    { name: 'Potatoes', category: categoryMap['Vegetables'], price: 35, stock: 150, weight: '1 kg', description: 'Premium quality potatoes. Versatile vegetable for any cuisine.', nutrition: 'Calories: 161, Potassium: 926mg, Vitamin C: 28%', bestSeller: true, image: '' },
    { name: 'Onions', category: categoryMap['Vegetables'], price: 30, stock: 120, weight: '1 kg', description: 'Fresh red onions. A staple ingredient in Indian cooking.', nutrition: 'Calories: 44, Fiber: 1.9g, Vitamin C: 12%', image: '' },
    { name: 'Broccoli', category: categoryMap['Vegetables'], price: 80, stock: 40, weight: '500 g', description: 'Imported fresh broccoli heads. Superfood packed with vitamins.', nutrition: 'Calories: 55, Vitamin C: 135%, Vitamin K: 116%', image: '' },

    // Dairy
    { name: 'Full Cream Milk', category: categoryMap['Dairy'], price: 65, stock: 200, weight: '1 liter', description: 'Fresh pasteurized full cream milk. Farm to table freshness.', nutrition: 'Calories: 150, Protein: 8g, Calcium: 30%', bestSeller: true, featured: true, image: '' },
    { name: 'Greek Yogurt', category: categoryMap['Dairy'], price: 90, stock: 50, weight: '400 g', description: 'Thick and creamy Greek yogurt. High in protein, low in sugar.', nutrition: 'Calories: 120, Protein: 15g, Calcium: 15%', featured: true, image: '' },
    { name: 'Butter (Amul)', category: categoryMap['Dairy'], price: 55, stock: 80, weight: '200 g', description: 'Amul pasteurized butter. Made from fresh cream.', nutrition: 'Calories: 100, Fat: 11g, Vitamin A: 8%', bestSeller: true, image: '' },
    { name: 'Cheddar Cheese', category: categoryMap['Dairy'], price: 180, stock: 35, weight: '200 g', description: 'Aged cheddar cheese block. Rich and sharp flavor.', nutrition: 'Calories: 113, Protein: 7g, Calcium: 20%', image: '' },

    // Snacks
    { name: 'Classic Chips', category: categoryMap['Snacks'], price: 30, stock: 100, weight: '150 g', description: "Crunchy salted potato chips. India's favorite snack time companion.", nutrition: 'Calories: 160, Fat: 10g, Sodium: 170mg', bestSeller: true, image: '' },
    { name: 'Mixed Nuts', category: categoryMap['Snacks'], price: 280, stock: 45, weight: '250 g', description: 'Premium roasted mixed nuts. Almonds, cashews, pistachios.', nutrition: 'Calories: 170, Protein: 5g, Fiber: 2g', featured: true, image: '' },
    { name: 'Dark Chocolate', category: categoryMap['Snacks'], price: 150, stock: 60, weight: '100 g', description: '72% dark chocolate bar. Rich antioxidants and bold flavor.', nutrition: 'Calories: 170, Iron: 12%, Fiber: 3g', featured: true, image: '' },
    { name: 'Protein Bars', category: categoryMap['Snacks'], price: 120, stock: 55, weight: '60 g', description: 'High protein energy bar. Perfect pre/post workout snack.', nutrition: 'Calories: 200, Protein: 20g, Fiber: 5g', image: '' },

    // Drinks
    { name: 'Orange Juice', category: categoryMap['Drinks'], price: 95, stock: 40, weight: '1 liter', description: 'Freshly squeezed orange juice. No added sugar, 100% natural.', nutrition: 'Calories: 110, Vitamin C: 124%, Potassium: 496mg', bestSeller: true, featured: true, image: '' },
    { name: 'Green Tea', category: categoryMap['Drinks'], price: 220, stock: 70, weight: '100 bags', description: 'Organic green tea bags. Rich in antioxidants for daily wellness.', nutrition: 'Calories: 0, Caffeine: 25mg', featured: true, image: '' },
    { name: 'Coconut Water', category: categoryMap['Drinks'], price: 40, stock: 90, weight: '500 ml', description: 'Natural coconut water. Ultimate hydration with electrolytes.', nutrition: 'Calories: 45, Potassium: 470mg, Sodium: 25mg', image: '' },
    { name: 'Cold Coffee', category: categoryMap['Drinks'], price: 50, stock: 60, weight: '200 ml', description: 'Ready to drink cold coffee. Creamy, smooth and refreshing.', nutrition: 'Calories: 140, Protein: 4g, Sugar: 20g', image: '' },

    // Bakery
    { name: 'Whole Wheat Bread', category: categoryMap['Bakery'], price: 45, stock: 40, weight: '400 g', description: 'Freshly baked whole wheat bread. Soft, nutritious, and fiber-rich.', nutrition: 'Calories: 69, Fiber: 2g, Protein: 4g', bestSeller: true, image: '' },
    { name: 'Chocolate Croissant', category: categoryMap['Bakery'], price: 60, stock: 30, weight: '2 pieces', description: 'Buttery flaky croissants with rich chocolate filling.', nutrition: 'Calories: 250, Fat: 14g, Sugar: 12g', featured: true, image: '' },
    { name: 'Butter Cookies', category: categoryMap['Bakery'], price: 85, stock: 50, weight: '200 g', description: 'Danish-style butter cookies tin. Perfect tea-time treat.', nutrition: 'Calories: 130, Fat: 7g, Sugar: 8g', image: '' },

    // Meat
    { name: 'Chicken Breast', category: categoryMap['Meat'], price: 250, stock: 30, weight: '500 g', description: 'Boneless chicken breast. Fresh, antibiotic-free poultry.', nutrition: 'Calories: 165, Protein: 31g, Fat: 3.6g', bestSeller: true, featured: true, image: '' },
    { name: 'Mutton Curry Cut', category: categoryMap['Meat'], price: 650, stock: 20, weight: '500 g', description: 'Fresh goat meat curry cut with bone. Perfect for weekend cooking.', nutrition: 'Calories: 143, Protein: 27g, Iron: 14%', image: '' },
    { name: 'Salmon Fillet', category: categoryMap['Meat'], price: 800, stock: 15, weight: '250 g', description: 'Norwegian salmon fillet. Rich in Omega-3 fatty acids.', nutrition: 'Calories: 208, Protein: 20g, Omega-3: 2.3g', featured: true, image: '' },

    // Household
    { name: 'Dish Soap', category: categoryMap['Household'], price: 75, stock: 80, weight: '500 ml', description: 'Concentrated dishwashing liquid. Tough on grease, gentle on hands.', nutrition: '', image: '' },
    { name: 'Paper Towels', category: categoryMap['Household'], price: 120, stock: 60, weight: '2 rolls', description: 'Super absorbent kitchen paper towels. 2-ply premium quality.', nutrition: '', bestSeller: true, image: '' },
    { name: 'Hand Sanitizer', category: categoryMap['Household'], price: 99, stock: 100, weight: '200 ml', description: '70% alcohol hand sanitizer. Kills 99.9% germs with aloe vera.', nutrition: '', image: '' },
    { name: 'Laundry Detergent', category: categoryMap['Household'], price: 250, stock: 45, weight: '1 kg', description: 'Premium washing powder. Deep clean with fresh fragrance.', nutrition: '', image: '' },
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});

        // Create admin
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@shopsmart.com',
            password: 'admin123',
            phone: '9999999999',
            role: 'admin',
            addresses: [{
                name: 'Admin Office',
                phone: '9999999999',
                street: '123 Admin Street',
                city: 'Mumbai',
                pincode: '400001',
                isDefault: true
            }]
        });
        console.log('Admin created: admin@shopsmart.com / admin123');

        // Create sample users
        const user1 = await User.create({
            name: 'Ravi Kumar',
            email: 'ravi@example.com',
            password: 'password123',
            phone: '9876543210',
            addresses: [{
                name: 'Ravi Kumar',
                phone: '9876543210',
                street: '45 MG Road, Indiranagar',
                city: 'Bangalore',
                pincode: '560038',
                isDefault: true
            }]
        });

        const user2 = await User.create({
            name: 'Sita Patel',
            email: 'sita@example.com',
            password: 'password123',
            phone: '8765432109',
            addresses: [{
                name: 'Sita Patel',
                phone: '8765432109',
                street: '78 Park Street',
                city: 'Kolkata',
                pincode: '700016',
                isDefault: true
            }]
        });
        console.log('Sample users created');

        // Create categories
        const createdCategories = await Category.insertMany(categories);
        const categoryMap = {};
        createdCategories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });
        console.log('Categories created');

        // Create products
        const productData = getProducts(categoryMap);
        const createdProducts = await Product.insertMany(productData);
        console.log(`${createdProducts.length} products created`);

        // Update category product counts
        for (const cat of createdCategories) {
            const count = await Product.countDocuments({ category: cat._id });
            await Category.findByIdAndUpdate(cat._id, { productCount: count });
        }

        // Create sample orders
        const sampleOrders = [
            {
                user: user1._id,
                items: [
                    { product: createdProducts[0]._id, name: createdProducts[0].name, price: createdProducts[0].price, quantity: 2, image: '' },
                    { product: createdProducts[10]._id, name: createdProducts[10].name, price: createdProducts[10].price, quantity: 1, image: '' }
                ],
                address: user1.addresses[0],
                paymentMethod: 'cod',
                status: 'Delivered',
                subtotal: 305,
                deliveryFee: 40,
                total: 345,
                deliveredAt: new Date()
            },
            {
                user: user2._id,
                items: [
                    { product: createdProducts[5]._id, name: createdProducts[5].name, price: createdProducts[5].price, quantity: 3, image: '' },
                    { product: createdProducts[14]._id, name: createdProducts[14].name, price: createdProducts[14].price, quantity: 2, image: '' }
                ],
                address: user2.addresses[0],
                paymentMethod: 'online',
                status: 'Shipped',
                subtotal: 180,
                deliveryFee: 40,
                total: 220
            },
            {
                user: user1._id,
                items: [
                    { product: createdProducts[2]._id, name: createdProducts[2].name, price: createdProducts[2].price, quantity: 1, image: '' },
                    { product: createdProducts[18]._id, name: createdProducts[18].name, price: createdProducts[18].price, quantity: 2, image: '' }
                ],
                address: user1.addresses[0],
                paymentMethod: 'cod',
                status: 'Pending',
                subtotal: 540,
                deliveryFee: 0,
                total: 540
            }
        ];

        await Order.insertMany(sampleOrders);
        console.log('Sample orders created');

        console.log('\n✅ Database seeded successfully!');
        console.log('-----------------------------------');
        console.log('Admin Login: admin@shopsmart.com / admin123');
        console.log('User Login:  ravi@example.com / password123');
        console.log('User Login:  sita@example.com / password123');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
