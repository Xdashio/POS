import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Package, AlertTriangle, Download, Upload } from 'lucide-react';
import { products, categories } from '../data/mockData';
import Dialog from './Dialog';

function InventoryScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    unit: 'pcs',
    barcode: '',
  });

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // This would normally save to backend
    console.log('Saving product:', formData);
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      unit: 'pcs',
      barcode: '',
    });
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      unit: product.unit,
      barcode: product.barcode,
    });
    setShowAddModal(true);
  };

  // Delete product
  const handleDelete = (productId) => {
    window.showToast('Product deleted successfully', 'success');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${amount.toFixed(2)}`;
  };

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Manage your products and stock levels</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn btn-outline btn-md">
              <Upload size={16} className="mr-2" />
              Import
            </button>
            <button className="btn btn-outline btn-md">
              <Download size={16} className="mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary btn-md"
            >
              <Plus size={16} className="mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="text-primary-500" size={24} />
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">
                  {products.filter(p => p.lowStock).length}
                </p>
              </div>
              <AlertTriangle className="text-orange-500" size={24} />
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}
                </p>
              </div>
              <Package className="text-green-500" size={24} />
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <Package className="text-blue-500" size={24} />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`btn btn-outline btn-md ${
                !selectedCategory ? 'btn-primary' : ''
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`btn btn-outline btn-md ${
                  selectedCategory === category.id ? 'btn-primary' : ''
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-gray-700">Product</th>
                  <th className="text-left p-4 font-medium text-gray-700">Category</th>
                  <th className="text-left p-4 font-medium text-gray-700">Stock</th>
                  <th className="text-left p-4 font-medium text-gray-700">Price</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Package className="text-gray-500" size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.barcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {categories.find(c => c.id === product.category)?.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${
                        product.lowStock ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="p-4">
                      {product.lowStock ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input w-full"
            />
          </div>

          <div>
            <label className="label">Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: parseInt(e.target.value)})}
              className="input w-full"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Selling Price</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Cost Price</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="input w-full"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="L">Liters</option>
                <option value="ml">Milliliters</option>
                <option value="m">Meters</option>
                <option value="set">Set</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Barcode</label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({...formData, barcode: e.target.value})}
              className="input w-full"
              placeholder="Optional"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
              className="flex-1 btn btn-outline btn-md"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary btn-md">
              {editingProduct ? 'Update' : 'Add'} Product
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export default InventoryScreen;
