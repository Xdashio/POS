// Mock data for the POS system

export const categories = [
  { id: 1, name: 'Groceries', icon: 'ShoppingCart' },
  { id: 2, name: 'Electronics', icon: 'Laptop' },
  { id: 3, name: 'Hardware', icon: 'Wrench' },
  { id: 4, name: 'Clothing', icon: 'Shirt' },
  { id: 5, name: 'Beverages', icon: 'Coffee' },
  { id: 6, name: 'Household', icon: 'Home' },
];

export const products = [
  // Groceries
  { id: 1, name: 'Sugar (1kg)', category: 1, price: 120, cost: 100, stock: 50, unit: 'kg', barcode: '1234567890123', lowStock: false, image: 'https://images.unsplash.com/photo-1587496179640-71d8275a7a0b?w=150&h=150&fit=crop&auto=format' },
  { id: 2, name: 'Cooking Oil (1L)', category: 1, price: 280, cost: 250, stock: 30, unit: 'L', barcode: '1234567890124', lowStock: false, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop&auto=format' },
  { id: 3, name: 'Milk (500ml)', category: 1, price: 65, cost: 55, stock: 5, unit: 'ml', barcode: '1234567890125', lowStock: true, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&h=150&fit=crop&auto=format' },
  { id: 4, name: 'Bread', category: 1, price: 55, cost: 45, stock: 20, unit: 'pcs', barcode: '1234567890126', lowStock: false, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&h=150&fit=crop&auto=format' },
  { id: 5, name: 'Rice (2kg)', category: 1, price: 220, cost: 200, stock: 15, unit: 'kg', barcode: '1234567890127', lowStock: false, image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=150&h=150&fit=crop&auto=format' },
  
  // Electronics
  { id: 6, name: 'Phone Charger', category: 2, price: 450, cost: 350, stock: 25, unit: 'pcs', barcode: '1234567890128', lowStock: false, image: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=150&h=150&fit=crop&auto=format' },
  { id: 7, name: 'USB Cable', category: 2, price: 150, cost: 100, stock: 40, unit: 'pcs', barcode: '1234567890129', lowStock: false, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&h=150&fit=crop&auto=format' },
  { id: 8, name: 'Power Bank', category: 2, price: 1200, cost: 900, stock: 8, unit: 'pcs', barcode: '1234567890130', lowStock: true, image: 'https://images.unsplash.com/photo-1596462317647-5166328c2b4d?w=150&h=150&fit=crop&auto=format' },
  { id: 9, name: 'Earphones', category: 2, price: 350, cost: 250, stock: 30, unit: 'pcs', barcode: '1234567890131', lowStock: false, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop&auto=format' },
  
  // Hardware
  { id: 10, name: 'Hammer', category: 3, price: 380, cost: 300, stock: 12, unit: 'pcs', barcode: '1234567890132', lowStock: false, image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop&auto=format' },
  { id: 11, name: 'Screwdriver Set', category: 3, price: 550, cost: 450, stock: 6, unit: 'set', barcode: '1234567890133', lowStock: true, image: 'https://images.unsplash.com/photo-1581091226825-a6a7a70c37f7?w=150&h=150&fit=crop&auto=format' },
  { id: 12, name: 'Nails (1kg)', category: 3, price: 120, cost: 100, stock: 25, unit: 'kg', barcode: '1234567890134', lowStock: false, image: 'https://images.unsplash.com/photo-1581091226825-a6a7a70c37f7?w=150&h=150&fit=crop&auto=format' },
  { id: 13, name: 'Paint Brush', category: 3, price: 85, cost: 65, stock: 18, unit: 'pcs', barcode: '1234567890135', lowStock: false, image: 'https://images.unsplash.com/photo-1581091226825-a6a7a70c37f8?w=150&h=150&fit=crop&auto=format' },
  
  // Clothing
  { id: 14, name: 'T-Shirt', category: 4, price: 450, cost: 350, stock: 35, unit: 'pcs', barcode: '1234567890136', lowStock: false, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop&auto=format' },
  { id: 15, name: 'Jeans', category: 4, price: 1200, cost: 900, stock: 20, unit: 'pcs', barcode: '1234567890137', lowStock: false, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&h=150&fit=crop&auto=format' },
  { id: 16, name: 'Cap', category: 4, price: 280, cost: 200, stock: 25, unit: 'pcs', barcode: '1234567890138', lowStock: false, image: 'https://images.unsplash.com/photo-1586859938036-5b4b5b5b5b5b?w=150&h=150&fit=crop&auto=format' },
  
  // Beverages
  { id: 17, name: 'Soda (500ml)', category: 5, price: 60, cost: 45, stock: 45, unit: 'ml', barcode: '1234567890139', lowStock: false, image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&h=150&fit=crop&auto=format' },
  { id: 18, name: 'Juice (1L)', category: 5, price: 150, cost: 120, stock: 22, unit: 'L', barcode: '1234567890140', lowStock: false, image: 'https://images.unsplash.com/photo-1600271886742-f049c45385b3?w=150&h=150&fit=crop&auto=format' },
  { id: 19, name: 'Water (500ml)', category: 5, price: 40, cost: 30, stock: 60, unit: 'ml', barcode: '1234567890141', lowStock: false, image: 'https://images.unsplash.com/photo-1548839140-b2dc039b7248?w=150&h=150&fit=crop&auto=format' },
  
  // Household
  { id: 20, name: 'Soap', category: 6, price: 45, cost: 35, stock: 40, unit: 'pcs', barcode: '1234567890142', lowStock: false, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&h=150&fit=crop&auto=format' },
  { id: 21, name: 'Detergent (1kg)', category: 6, price: 180, cost: 150, stock: 28, unit: 'kg', barcode: '1234567890143', lowStock: false, image: 'https://images.unsplash.com/photo-1585720541009-37031c8b0c99?w=150&h=150&fit=crop&auto=format' },
  { id: 22, name: 'Bleach (1L)', category: 6, price: 120, cost: 100, stock: 15, unit: 'L', barcode: '1234567890144', lowStock: false, image: 'https://images.unsplash.com/photo-1585720541009-37031c8b0c98?w=150&h=150&fit=crop&auto=format' },
];

export const customers = [
  { id: 1, name: 'John Kamau', phone: '+254712345678', email: 'john.kamau@email.com', loyaltyPoints: 120, totalSpent: 15420 },
  { id: 2, name: 'Mary Wanjiru', phone: '+254723456789', email: 'mary.wanjiru@email.com', loyaltyPoints: 85, totalSpent: 8900 },
  { id: 3, name: 'David Ochieng', phone: '+254734567890', email: 'david.o@email.com', loyaltyPoints: 200, totalSpent: 22100 },
  { id: 4, name: 'Grace Achieng', phone: '+254745678901', email: 'grace.achieng@email.com', loyaltyPoints: 45, totalSpent: 5600 },
  { id: 5, name: 'Peter Njoroge', phone: '+254756789012', email: 'peter.n@email.com', loyaltyPoints: 150, totalSpent: 18750 },
];

export const transactions = [
  {
    id: 1,
    date: new Date('2024-01-15T10:30:00'),
    customerId: 1,
    items: [
      { productId: 1, name: 'Sugar (1kg)', quantity: 2, price: 120, total: 240 },
      { productId: 4, name: 'Bread', quantity: 3, price: 55, total: 165 },
      { productId: 17, name: 'Soda (500ml)', quantity: 4, price: 60, total: 240 }
    ],
    subtotal: 645,
    tax: 64.5,
    discount: 0,
    total: 709.5,
    paymentMethod: 'mpesa',
    paymentStatus: 'completed'
  },
  {
    id: 2,
    date: new Date('2024-01-15T11:45:00'),
    customerId: 2,
    items: [
      { productId: 6, name: 'Phone Charger', quantity: 1, price: 450, total: 450 },
      { productId: 7, name: 'USB Cable', quantity: 2, price: 150, total: 300 }
    ],
    subtotal: 750,
    tax: 75,
    discount: 50,
    total: 775,
    paymentMethod: 'cash',
    paymentStatus: 'completed'
  },
  {
    id: 3,
    date: new Date('2024-01-15T14:20:00'),
    customerId: null,
    items: [
      { productId: 10, name: 'Hammer', quantity: 1, price: 380, total: 380 },
      { productId: 12, name: 'Nails (1kg)', quantity: 2, price: 120, total: 240 }
    ],
    subtotal: 620,
    tax: 62,
    discount: 0,
    total: 682,
    paymentMethod: 'card',
    paymentStatus: 'completed'
  }
];

export const salesData = {
  daily: [
    { date: '2024-01-10', sales: 12500, transactions: 45 },
    { date: '2024-01-11', sales: 15800, transactions: 52 },
    { date: '2024-01-12', sales: 18900, transactions: 61 },
    { date: '2024-01-13', sales: 14200, transactions: 48 },
    { date: '2024-01-14', sales: 22100, transactions: 73 },
    { date: '2024-01-15', sales: 19600, transactions: 64 },
  ],
  weekly: [
    { week: 'Week 1', sales: 89500 },
    { week: 'Week 2', sales: 92300 },
    { week: 'Week 3', sales: 78600 },
    { week: 'Week 4', sales: 105400 },
  ],
  topProducts: [
    { name: 'Sugar (1kg)', sales: 45, revenue: 5400 },
    { name: 'Cooking Oil (1L)', sales: 32, revenue: 8960 },
    { name: 'Phone Charger', sales: 28, revenue: 12600 },
    { name: 'Bread', sales: 67, revenue: 3685 },
    { name: 'Soda (500ml)', sales: 89, revenue: 5340 },
  ]
};

export const businessSettings = {
  name: 'Infrava POS',
  currency: 'KES',
  taxRate: 0.10,
  lowStockThreshold: 10,
  businessType: 'retail',
  features: {
    inventory: true,
    customers: true,
    reports: true,
    loyalty: true,
    discounts: true,
  }
};
