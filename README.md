# Kenyan POS System

A modern, minimal Point of Sale system prototype tailored for Kenyan businesses, including small kiosks, retail shops, hardware stores, and supermarkets.

## Features

### 🛒 Sales Screen (Main POS Interface)
- Fast product search (by name, barcode, or category)
- Add/remove items to cart with quantity controls
- Real-time total calculation with taxes
- Multiple payment options:
  - Cash
  - M-Pesa (Kenyan mobile money)
  - Card payments
- Quick checkout flow (≤ 3 taps)
- Customer selection for sales tracking

### 📦 Inventory Management
- Add/edit products with full CRUD operations
- Category-based organization
- Real-time stock level tracking
- Low-stock alerts with visual indicators
- Bulk import/export functionality (mocked)
- Search and filter capabilities
- Multiple unit types (pieces, kg, liters, etc.)

### 👥 Customer Management
- Add customer profiles with contact information
- Purchase history tracking
- Loyalty points system
- Customer statistics and insights
- Search and filter customers

### 📊 Reports Dashboard
- Daily/weekly sales summaries
- Interactive charts and visualizations
- Top-selling products analysis
- Revenue trends with growth indicators
- Sales by category breakdown
- Recent transactions log
- Export functionality

### 🌍 Kenyan Context Features
- **KES Currency**: Full Kenyan Shilling support
- **M-Pesa Integration**: Simulated mobile money payments
- **Offline-First Design**: UI indicators for online/offline status
- **Localized Design**: Optimized for Kenyan business practices
- **Multi-Business Support**: Configurable for different business types

## Design Principles

- **Clean & Minimal**: Neutral colors (white, gray, black) with green accent
- **Touch-Friendly**: Large buttons optimized for tablets
- **Fast Performance**: Optimized for low-resource environments
- **Accessibility**: Clear visual hierarchy and minimal clutter
- **Responsive**: Works on tablets, desktops, and mobile devices

## Technology Stack

- **Frontend**: React 18
- **Styling**: TailwindCSS with custom design system
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Build Tool**: Create React App

## Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kenyan-pos-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── CustomerScreen.js
│   ├── InventoryScreen.js
│   └── ReportsScreen.js
├── data/               # Mock data
│   └── mockData.js
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles and TailwindCSS
```

## Key Features Explained

### Sales Workflow
1. **Product Selection**: Search or browse products by category
2. **Cart Management**: Add items, adjust quantities, see real-time totals
3. **Customer Assignment**: Optional customer selection for tracking
4. **Payment Processing**: Choose from cash, M-Pesa, or card payments
5. **Receipt Generation**: Automatic transaction recording

### Inventory Management
- **Real-time Stock**: Automatic stock updates on sales
- **Low Stock Alerts**: Visual indicators for items below threshold
- **Bulk Operations**: Import/export product catalogs
- **Category Management**: Organize products by business type

### Customer Relations
- **Purchase History**: Track all customer transactions
- **Loyalty Program**: Points-based rewards system
- **Contact Management**: Store customer information
- **Analytics**: Customer spending patterns and insights

### Business Intelligence
- **Sales Analytics**: Daily, weekly, and monthly reports
- **Product Performance**: Best-selling items analysis
- **Revenue Tracking**: Comprehensive financial overview
- **Trend Analysis**: Growth indicators and forecasts

## Kenyan Market Adaptations

### Payment Methods
- **M-Pesa**: Kenya's leading mobile money service
- **Cash**: Traditional payment method
- **Card**: Credit/debit card support

### Currency Support
- **KES**: Kenyan Shilling formatting and display
- **Tax Calculation**: 10% VAT (Kenyan standard)

### Business Types Supported
- **Retail Shops**: General merchandise
- **Hardware Stores**: Tools and building materials
- **Supermarkets**: Groceries and household items
- **Small Kiosks**: Limited inventory, quick transactions

## Mock Data

The system includes comprehensive mock data for:
- 22+ products across 6 categories
- 5 sample customers with purchase history
- Transaction records with different payment methods
- Sales analytics and reports data

## Responsive Design

- **Tablet Optimized**: Primary target for POS operations
- **Desktop Support**: Full-featured management interface
- **Mobile Compatible**: Basic functionality on smartphones
- **Touch Interface**: Large touch targets and gestures

## Performance Considerations

- **Offline Capability**: UI works without internet connection
- **Fast Loading**: Optimized for low-resource devices
- **Minimal Dependencies**: Lightweight bundle size
- **Efficient Rendering**: React optimization patterns

## Future Enhancements

- Real backend integration
- Barcode scanning support
- Receipt printing
- Multi-user management
- Advanced reporting
- API integrations
- Mobile app version

## License

This project is a prototype/demo for educational purposes.

---

**Built with ❤️ for Kenyan businesses**
# POS
