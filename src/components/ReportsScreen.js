import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar, Download } from 'lucide-react';
import { transactions, salesData } from '../data/mockData';

function ReportsScreen() {
  const [dateRange, setDateRange] = useState('week');
  
  // Calculate statistics
  const totalSales = salesData.daily.reduce((sum, day) => sum + day.sales, 0);
  const totalTransactions = salesData.daily.reduce((sum, day) => sum + day.transactions, 0);
  const avgTransactionValue = totalSales / totalTransactions;
  
  const previousWeekSales = salesData.daily.slice(0, 3).reduce((sum, day) => sum + day.sales, 0);
  const currentWeekSales = salesData.daily.slice(3).reduce((sum, day) => sum + day.sales, 0);
  const salesGrowth = ((currentWeekSales - previousWeekSales) / previousWeekSales * 100).toFixed(1);

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${amount.toLocaleString()}`;
  };

  // Colors for charts
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your business performance and insights</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-outline btn-md">
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Revenue</span>
            <DollarSign className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
          <div className="flex items-center mt-2">
            {salesGrowth > 0 ? (
              <>
                <TrendingUp className="text-green-500 mr-1" size={16} />
                <span className="text-sm text-green-600">+{salesGrowth}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="text-red-500 mr-1" size={16} />
                <span className="text-sm text-red-600">{salesGrowth}%</span>
              </>
            )}
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Transactions</span>
            <ShoppingCart className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500">Average: {formatCurrency(avgTransactionValue)}</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Top Product</span>
            <TrendingUp className="text-purple-500" size={20} />
          </div>
          <p className="text-lg font-bold text-gray-900 truncate">{salesData.topProducts[0]?.name}</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500">
              {salesData.topProducts[0]?.sales} sold • {formatCurrency(salesData.topProducts[0]?.revenue)}
            </span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Growth Rate</span>
            <Calendar className="text-orange-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{salesGrowth}%</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500">Week over week</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Sales']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Comparison */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Sales']}
              />
              <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {salesData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Groceries', value: 35 },
                  { name: 'Electronics', value: 25 },
                  { name: 'Hardware', value: 20 },
                  { name: 'Clothing', value: 12 },
                  { name: 'Beverages', value: 8 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Groceries', value: 35 },
                  { name: 'Electronics', value: 25 },
                  { name: 'Hardware', value: 20 },
                  { name: 'Clothing', value: 12 },
                  { name: 'Beverages', value: 8 }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Sales Share']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6">
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 10).map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.DateTimeFormat('en-KE', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.paymentMethod === 'mpesa' 
                          ? 'bg-green-100 text-green-700'
                          : transaction.paymentMethod === 'cash'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {transaction.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsScreen;
