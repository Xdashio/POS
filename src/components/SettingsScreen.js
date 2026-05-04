import React, { useState } from 'react';
import { Save, X, Store, DollarSign, Package, Users, BarChart3, Star, Tag, Shield, Database } from 'lucide-react';
import { businessSettings } from '../data/mockData';
import Dialog from './Dialog';

function SettingsScreen() {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [settings, setSettings] = useState({
    name: businessSettings.name,
    currency: businessSettings.currency,
    taxRate: businessSettings.taxRate,
    lowStockThreshold: businessSettings.lowStockThreshold,
    businessType: businessSettings.businessType,
    features: {
      inventory: businessSettings.features.inventory,
      customers: businessSettings.features.customers,
      reports: businessSettings.features.reports,
      loyalty: businessSettings.features.loyalty,
      discounts: businessSettings.features.discounts,
    }
  });

  const handleSave = () => {
    window.showToast('Settings saved successfully', 'success');
    setShowSaveDialog(false);
  };

  const handleReset = () => {
    setSettings({
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
    });
    window.showToast('Settings reset to defaults', 'info');
  };

  const toggleFeature = (feature) => {
    setSettings({
      ...settings,
      features: {
        ...settings.features,
        [feature]: !settings.features[feature]
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your POS system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Store className="text-primary-600 mr-3" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">Business Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({...settings, name: e.target.value})}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="label">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="input w-full"
              >
                <option value="KES">Kenyan Shilling (KES)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
            
            <div>
              <label className="label">Business Type</label>
              <select
                value={settings.businessType}
                onChange={(e) => setSettings({...settings, businessType: e.target.value})}
                className="input w-full"
              >
                <option value="retail">Retail Store</option>
                <option value="restaurant">Restaurant</option>
                <option value="hardware">Hardware Store</option>
                <option value="supermarket">Supermarket</option>
                <option value="kiosk">Kiosk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tax & Pricing */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="text-primary-600 mr-3" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Tax & Pricing</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.taxRate * 100}
                onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value) / 100})}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="label">Low Stock Threshold</label>
              <input
                type="number"
                min="1"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                className="input w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this quantity</p>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center mb-4">
            <Package className="text-primary-600 mr-3" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Features</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Package className="text-gray-600 mr-3" size={18} />
                <div>
                  <p className="font-medium text-gray-900">Inventory</p>
                  <p className="text-sm text-gray-500">Product management</p>
                </div>
              </div>
              <button
                onClick={() => toggleFeature('inventory')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.features.inventory ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  settings.features.inventory ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Users className="text-gray-600 mr-3" size={18} />
                <div>
                  <p className="font-medium text-gray-900">Customers</p>
                  <p className="text-sm text-gray-500">Customer management</p>
                </div>
              </div>
              <button
                onClick={() => toggleFeature('customers')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.features.customers ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  settings.features.customers ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="text-gray-600 mr-3" size={18} />
                <div>
                  <p className="font-medium text-gray-900">Reports</p>
                  <p className="text-sm text-gray-500">Analytics & insights</p>
                </div>
              </div>
              <button
                onClick={() => toggleFeature('reports')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.features.reports ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  settings.features.reports ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Star className="text-gray-600 mr-3" size={18} />
                <div>
                  <p className="font-medium text-gray-900">Loyalty</p>
                  <p className="text-sm text-gray-500">Customer rewards</p>
                </div>
              </div>
              <button
                onClick={() => toggleFeature('loyalty')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.features.loyalty ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  settings.features.loyalty ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Tag className="text-gray-600 mr-3" size={18} />
                <div>
                  <p className="font-medium text-gray-900">Discounts</p>
                  <p className="text-sm text-gray-500">Promotions & offers</p>
                </div>
              </div>
              <button
                onClick={() => toggleFeature('discounts')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.features.discounts ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  settings.features.discounts ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center mb-4">
            <Shield className="text-primary-600 mr-3" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Data Management</h3>
              <div className="space-y-3">
                <button className="w-full btn btn-outline btn-md flex items-center justify-center">
                  <Database className="mr-2" size={16} />
                  Export Data
                </button>
                <button className="w-full btn btn-outline btn-md flex items-center justify-center">
                  <Database className="mr-2" size={16} />
                  Import Data
                </button>
                <button className="w-full btn btn-outline btn-md flex items-center justify-center">
                  <Database className="mr-2" size={16} />
                  Backup Settings
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full btn btn-primary btn-md flex items-center justify-center"
                >
                  <Save className="mr-2" size={16} />
                  Save Settings
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full btn btn-outline btn-md flex items-center justify-center"
                >
                  <X className="mr-2" size={16} />
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <Dialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        title="Save Settings"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to save these settings? Changes will take effect immediately.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSaveDialog(false)}
              className="flex-1 btn btn-outline btn-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 btn btn-primary btn-md"
            >
              Save Settings
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default SettingsScreen;
