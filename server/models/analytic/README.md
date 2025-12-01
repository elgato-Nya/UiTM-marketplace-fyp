# Analytics Models - Quick Reference

## 📚 Files Structure
```
models/analytic/
├── merchantAnalytics.model.js   ← Merchant dashboard data
├── platformAnalytics.model.js   ← Admin dashboard data
└── index.js                     ← Exports both models
```

## 🎯 When to Use Each Model

### MerchantAnalytics
**USE FOR:** Individual merchant's shop performance
**ACCESSED BY:** Merchants viewing their own dashboard
**ENDPOINTS:** `/api/analytics/merchant/*`

### PlatformAnalytics
**USE FOR:** Overall marketplace statistics
**ACCESSED BY:** Admins only (super admins see financial data)
**ENDPOINTS:** `/api/admin/analytics/*`

## 🔍 Quick Query Examples

### Get Merchant's Latest Analytics
```javascript
const analytics = await MerchantAnalytics.getLatest(merchantId);
console.log(analytics.revenue.total);  // RM 5000
console.log(analytics.orders.pending); // 5 orders need action
```

### Get Today's Platform Analytics
```javascript
const today = await PlatformAnalytics.getOrCreate(new Date());
console.log(today.users.activeToday);     // 500 active users
console.log(today.merchants.pendingVerification); // 50 need approval
```

### Get Date Range (for charts)
```javascript
const last30Days = await PlatformAnalytics.getRange(
  new Date('2025-10-10'),
  new Date('2025-11-09')
);
// Returns array of daily analytics
```

## 📊 Key Metrics Explained

### Revenue vs Sales
- **Revenue** = Money (RM)
- **Sales** = Number of transactions
- Example: 10 sales × RM 50 each = 10 sales, RM 500 revenue

### GMV (Gross Merchandise Value)
- Total money in completed orders
- This is merchant revenue, NOT platform profit
- Super admin only!

### Conversion Rate
- (Purchases / Views) × 100
- Example: 1000 views, 50 purchases = 5% conversion

### Growth Rate
- ((Current - Previous) / Previous) × 100
- Can be negative (decline) or positive (growth)

## 🚫 Common Mistakes to Avoid

### ❌ DON'T: Query on every dashboard load
```javascript
// BAD: Slow! Calculates every time
const orders = await Order.aggregate([...complex query...]);
```

### ✅ DO: Use pre-calculated analytics
```javascript
// GOOD: Fast! Already calculated
const analytics = await MerchantAnalytics.getLatest(merchantId);
```

### ❌ DON'T: Update analytics manually
```javascript
// BAD: Will be overwritten by scheduled job
analytics.revenue.total = 5000;
await analytics.save();
```

### ✅ DO: Let scheduled job handle updates
```javascript
// GOOD: Job runs every 15 mins
// Or trigger manual refresh via API endpoint
```

## 🔄 Update Cycle

```
Every 15 minutes:
└─> Scheduled job runs
    └─> Calculates latest data
        └─> Saves to analytics models
            └─> Dashboard shows updated data

Manual refresh (rate-limited):
└─> Merchant clicks "Refresh"
    └─> API endpoint triggered
        └─> Calculates fresh data
            └─> Returns immediately
```

## 🎨 Field Naming Convention

- **total**: Overall count/amount
- **today/week/month**: Time-scoped values
- **byCategory/byCampus**: Array of breakdowns
- **percent**: Percentage value (0-100)
- **rate**: Percentage (e.g., growth rate, conversion rate)
- **count**: Number of items
- **amount**: Money value

## 🧪 Testing Queries

```javascript
// In MongoDB shell or Compass
db.merchantanalytics.findOne({ merchantId: ObjectId("...") })

// Check latest calculation time
db.merchantanalytics.find().sort({ lastCalculated: -1 }).limit(1)

// Find stale data (not updated in 1 hour)
db.merchantanalytics.find({
  lastCalculated: { $lt: new Date(Date.now() - 3600000) }
})
```

## 📈 Dashboard Use Cases

### Merchant Dashboard
```javascript
const analytics = await MerchantAnalytics.getLatest(merchantId);

// KPI Cards
revenue: analytics.revenue.total
sales: analytics.sales.count
avgOrder: analytics.orders.averageValue
pending: analytics.orders.pending

// Revenue Chart (line chart)
data: analytics.sales.trend

// Category Breakdown (pie chart)
data: analytics.revenue.byCategory

// Top Products (table)
data: analytics.listings.topSelling
```

### Admin Dashboard
```javascript
const analytics = await PlatformAnalytics.getLatest();

// Platform Overview
totalUsers: analytics.users.total
activeUsers: analytics.users.activeToday
totalGMV: analytics.orders.gmv.total  // Super admin only

// Pending Actions
verificationQueue: analytics.merchants.pendingVerification

// Growth Chart
const last30 = await PlatformAnalytics.getRange(start, end);
data: last30.map(d => ({ date: d.date, users: d.users.total }))
```

## 🔐 Access Control

### Merchant Analytics
- ✅ Merchant can see their own data
- ❌ Merchant cannot see other merchant's data
- ✅ Admin can see any merchant's data

### Platform Analytics
- ❌ Consumers cannot access
- ❌ Merchants cannot access
- ✅ Moderator admins can access (without financial data)
- ✅ Super admins can access (with financial data)

## 📝 Notes

- Analytics are **snapshots** - they represent data at calculation time
- Old analytics are kept for historical comparison
- Scheduled job creates new document each day (period="daily")
- Manual refresh updates existing document
- Consider cleanup job to delete analytics older than 1 year
