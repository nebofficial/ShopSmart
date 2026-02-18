export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    addresses: Address[];
    status: string;
    token?: string;
    createdAt?: string;
}

export interface Address {
    _id?: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    pincode: string;
    isDefault: boolean;
}

export interface Category {
    _id: string;
    name: string;
    image: string;
    productCount: number;
}

export interface Product {
    _id: string;
    name: string;
    category: Category | string;
    price: number;
    discount: number;
    stock: number;
    weight: string;
    description: string;
    image: string;
    nutrition: string;
    status: string;
    featured: boolean;
    bestSeller: boolean;
    createdAt: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
}

export interface OrderItem {
    product: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    _id: string;
    user: User | string;
    items: OrderItem[];
    address: Address;
    paymentMethod: string;
    status: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
    createdAt: string;
    deliveredAt?: string;
}

export interface ProductResponse {
    products: Product[];
    page: number;
    pages: number;
    total: number;
}

export interface OrderResponse {
    orders: Order[];
    page: number;
    pages: number;
    total: number;
}

export interface Report {
    totalOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    dailyRevenue: { _id: string; revenue: number; count: number }[];
    topProducts: { _id: string; totalSold: number; revenue: number }[];
}
