import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, Calendar, ShoppingCart, Star, Edit2, Trash2, User } from 'lucide-react';
import { customers, transactions } from '../data/mockData';
import Dialog from './Dialog';

function CustomerScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  // Filter customers
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // This would normally save to backend
    console.log('Adding customer:', formData);
    setShowAddModal(false);
    setFormData({ name: '', phone: '', email: '' });
  };

  // View customer details
  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get customer transactions
  const getCustomerTransactions = (customerId) => {
    return transactions.filter(t => t.customerId === customerId);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships and loyalty</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-md"
        >
          <Plus size={16} className="mr-2" />
          Add Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <User className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active This Month</p>
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => {
                  const customerTransactions = getCustomerTransactions(c.id);
                  return customerTransactions.some(t => 
                    new Date(t.date).getMonth() === new Date().getMonth()
                  );
                }).length}
              </p>
            </div>
            <Calendar className="text-green-500" size={24} />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  customers.reduce((sum, c) => sum + (c.totalSpent / Math.max(1, getCustomerTransactions(c.id).length)), 0) / customers.length
                )}
              </p>
            </div>
            <ShoppingCart className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Loyalty Members</p>
              <p className="text-2xl font-bold text-orange-600">
                {customers.filter(c => c.loyaltyPoints > 0).length}
              </p>
            </div>
            <Star className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => {
          const customerTransactions = getCustomerTransactions(customer.id);
          const recentTransaction = customerTransactions[0];
          
          return (
            <div key={customer.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">Customer ID: #{customer.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => viewCustomerDetails(customer)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1 text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={14} className="mr-2" />
                  {customer.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={14} className="mr-2" />
                  {customer.email}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Spent</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Loyalty Points</span>
                  <span className="font-semibold text-orange-600">{customer.loyaltyPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Purchase</span>
                  <span className="text-sm text-gray-900">
                    {recentTransaction ? formatDate(recentTransaction.date) : 'No purchases'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => viewCustomerDetails(customer)}
                className="w-full mt-3 btn btn-outline btn-sm"
              >
                View Details
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Customer"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input w-full"
              placeholder="e.g., John Kamau"
            />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="input w-full"
              placeholder="e.g., +254712345678"
            />
          </div>

          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input w-full"
              placeholder="e.g., customer@email.com"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 btn btn-outline btn-md"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary btn-md">
              Add Customer
            </button>
          </div>
        </form>
      </Dialog>

      {/* Customer Details Modal */}
      <Dialog
        isOpen={showCustomerDetails && selectedCustomer}
        onClose={() => setShowCustomerDetails(false)}
        title="Customer Details"
        size="xl"
      >
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="text-primary-600" size={28} />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900">{selectedCustomer?.name}</h4>
              <p className="text-gray-600">Customer ID: #{selectedCustomer?.id.toString().padStart(4, '0')}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Phone size={16} className="mr-2 text-gray-400" />
                  {selectedCustomer?.phone}
                </div>
                <div className="flex items-center text-sm">
                  <Mail size={16} className="mr-2 text-gray-400" />
                  {selectedCustomer?.email}
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h5 className="font-medium text-gray-900 mb-2">Account Summary</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-medium">{formatCurrency(selectedCustomer?.totalSpent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Loyalty Points</span>
                  <span className="font-medium text-orange-600">{selectedCustomer?.loyaltyPoints}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Recent Transactions</h5>
            <div className="space-y-2">
              {getCustomerTransactions(selectedCustomer?.id).length > 0 ? (
                getCustomerTransactions(selectedCustomer?.id).map(transaction => (
                  <div key={transaction.id} className="card p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          #{transaction.id.toString().padStart(4, '0')}
                        </p>
                        <p className="text-xs text-gray-600">{formatDate(transaction.date)}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.items.length} items • {transaction.paymentMethod}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(transaction.total)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <ShoppingCart className="mx-auto mb-2" size={24} />
                  <p className="text-sm">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default CustomerScreen;
