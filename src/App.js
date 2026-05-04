import React, { useState } from 'react';
import { ShoppingCart, Search, Package, Users, BarChart3, Settings, Wifi, WifiOff, X, Plus, Minus, Trash2, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { products, categories, customers, businessSettings } from './data/mockData';
import InventoryScreen from './components/InventoryScreen';
import CustomerScreen from './components/CustomerScreen';
import ReportsScreen from './components/ReportsScreen';
import SettingsScreen from './components/SettingsScreen';
import PaymentProcessing from './components/PaymentProcessing';
import ToastContainer from './components/ToastContainer';

function App() {
  const [currentView, setCurrentView] = useState('sales');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isOnline] = useState(true);
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add item to cart
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, total: product.price }];
    });
  };

  // Update cart item quantity
  const updateQuantity = (productId, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity, total: newQuantity * item.price };
        }
        return item;
      });
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * businessSettings.taxRate;
  const total = subtotal + tax;

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${amount.toFixed(2)}`;
  };

  // Handle payment method selection
  const handlePaymentMethod = (method) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(false);
    setShowPaymentProcessing(true);
  };

  // Handle payment completion
  const handlePaymentComplete = (paymentResult) => {
    setShowPaymentProcessing(false);
    window.showToast(`Payment of ${formatCurrency(total)} processed via ${paymentResult.method}`, 'success');
    setCart([]);
    setSelectedCustomer(null);
    setSelectedPaymentMethod('');
  };

  // Handle payment processing close
  const handlePaymentProcessingClose = () => {
    setShowPaymentProcessing(false);
    setSelectedPaymentMethod('');
  };

  // Handle back to payment methods
  const handleBackToPaymentMethods = () => {
    setShowPaymentProcessing(false);
    setShowPaymentModal(true);
  };

  // Navigation component
  const Navigation = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-gray-900">{businessSettings.name}</h1>
          <nav className="flex space-x-4">
            <button
              onClick={() => setCurrentView('sales')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                currentView === 'sales' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingCart size={18} />
              <span className="font-medium">Sales</span>
            </button>
            <button
              onClick={() => setCurrentView('inventory')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                currentView === 'inventory' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package size={18} />
              <span className="font-medium">Inventory</span>
            </button>
            <button
              onClick={() => setCurrentView('customers')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                currentView === 'customers' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={18} />
              <span className="font-medium">Customers</span>
            </button>
            <button
              onClick={() => setCurrentView('reports')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                currentView === 'reports' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={18} />
              <span className="font-medium">Reports</span>
            </button>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <>
                <Wifi size={16} className="text-green-500" />
                <span className="text-sm text-gray-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-orange-500" />
                <span className="text-sm text-gray-600">Offline</span>
              </>
            )}
          </div>
          <button 
            onClick={() => setCurrentView('settings')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  // Sales Screen
  const SalesScreen = () => (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        {/* Search and Categories */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
                autoFocus
              />
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Products
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-3 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all text-left group transform hover:scale-105 duration-200"
              >
                <div className="aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=e5e7eb&color=6b7280&size=150`;
                    }}
                  />
                  {product.lowStock && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">
                      Low Stock
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-primary-700 transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-primary-600">{formatCurrency(product.price)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Stock: {product.stock} {product.unit}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Cart Header */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-900">Current Sale</h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Customer:</span>
            <select
              value={selectedCustomer || ''}
              onChange={(e) => setSelectedCustomer(e.target.value || null)}
              className="flex-1 input text-xs"
            >
              <option value="">Walk-in</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3">
          {cart.length === 0 ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500 text-sm font-medium">Cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Add products to start sale</p>
            </div>
          ) : (
            <div className="space-y-2 pb-3">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-xs mb-1">{item.name}</h4>
                      <p className="text-xs text-gray-600">{formatCurrency(item.price)} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="font-bold text-sm text-primary-600">{formatCurrency(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary - Fixed at bottom */}
        <div className="border-t border-gray-200 bg-white shadow-sm">
          {cart.length === 0 ? (
            <div className="p-3">
              <p className="text-center text-gray-500 text-xs">Add items to proceed</p>
            </div>
          ) : (
            <div className="p-3 space-y-3 bg-gradient-to-t from-gray-50 to-white">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(total)}</span>
              </div>
              
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full btn btn-primary btn-md font-medium shadow hover:shadow-md transition-shadow"
              >
                Pay Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Payment Modal
  const PaymentModal = () => {
    if (!showPaymentModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Select Payment Method</h3>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-primary-600">{formatCurrency(total)}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePaymentMethod('cash')}
                className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <Banknote className="text-gray-600 group-hover:text-primary-600" size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">Cash</p>
                  <p className="text-sm text-gray-500">Pay with cash</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              
              <button
                onClick={() => handlePaymentMethod('mpesa')}
                className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Smartphone className="text-green-600" size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">M-Pesa</p>
                  <p className="text-sm text-gray-500">Mobile money payment</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              
              <button
                onClick={() => handlePaymentMethod('card')}
                className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <CreditCard className="text-blue-600" size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">Card</p>
                  <p className="text-sm text-gray-500">Credit/Debit card</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'sales':
        return <SalesScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'customers':
        return <CustomerScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <SalesScreen />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navigation />
      {currentView === 'sales' ? (
        <>
          <SalesScreen />
          <PaymentModal />
        </>
      ) : (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {renderCurrentView()}
        </div>
      )}
      <ToastContainer />
      {showPaymentProcessing && (
        <PaymentProcessing
          method={selectedPaymentMethod}
          amount={total}
          onClose={handlePaymentProcessingClose}
          onComplete={handlePaymentComplete}
          onBack={handleBackToPaymentMethods}
        />
      )}
    </div>
  );
}

export default App;
