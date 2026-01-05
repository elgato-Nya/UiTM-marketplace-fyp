# Admin Panel

> Platform administration and moderation tools

[← Back to Features Index](./README.md)

---

## Overview

The admin panel provides platform administrators with tools to manage users, moderate content, configure settings, and monitor system health.

**Status:** 🚧 Planned Enhancement

## Table of Contents

- [10.1 Admin Dashboard](#101-admin-dashboard)
- [10.2 User Management](#102-user-management)
- [10.3 Content Moderation](#103-content-moderation)
- [10.4 Platform Settings](#104-platform-settings)

---

## 10.1 Admin Dashboard

**Purpose:** Platform administration and monitoring

**Page:** `/admin/dashboard`

**Access:** Admin role required

**Status:** 🚧 Planned

### Planned Features

| Feature                | Description                | Priority |
| ---------------------- | -------------------------- | -------- |
| Platform Overview      | Key metrics display        | High     |
| User Statistics        | Registration and activity  | High     |
| Transaction Monitoring | Order and payment tracking | High     |
| Revenue Tracking       | Platform earnings          | High     |
| System Health          | Server status and logs     | Medium   |
| Active Sessions        | Current user activity      | Medium   |
| Error Logs             | System error tracking      | Medium   |
| Performance Metrics    | Response times, load       | Low      |

### Planned Metrics

| Metric                 | Description             |
| ---------------------- | ----------------------- |
| Total Users            | Registered accounts     |
| Active Users (DAU/MAU) | Daily/Monthly active    |
| Total Merchants        | Seller accounts         |
| Total Listings         | Products and services   |
| Total Orders           | All-time orders         |
| Platform Revenue       | Commission earnings     |
| Pending Issues         | Reports awaiting action |
| System Uptime          | Server availability     |

### Planned Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Admin Dashboard                              Welcome, Admin 👋   │
├─────────────────────────────────────────────────────────────────┤
│ PLATFORM OVERVIEW                                                │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┬───────────┐ │
│ │ Users   │ Merchants│ Listings│ Orders  │ Revenue │ Issues   │ │
│ │ 5,420   │ 245     │ 3,890   │ 12,450  │ RM 60K  │ 12       │ │
│ │ ↑ 15%   │ ↑ 12%   │ ↑ 18%   │ ↑ 22%   │ ↑ 20%   │ ↓ 5%     │ │
│ └─────────┴─────────┴─────────┴─────────┴─────────┴───────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ QUICK ACTIONS                                                    │
│ [👥 Manage Users] [📋 Reports] [⚙️ Settings] [📊 Analytics]     │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┬─────────────────────────────────┐
│ │ RECENT ACTIVITY             │ PENDING ACTIONS                 │
│ │ ────────────────────────    │ ──────────────────────          │
│ │ • New user registered       │ ⚠️ 5 reports pending            │
│ │ • Order #123 completed      │ ⚠️ 3 verifications pending      │
│ │ • Listing #456 reported     │ ⚠️ 2 refunds requested          │
│ │ • Merchant verified         │ ⚠️ 2 disputes open              │
│ └─────────────────────────────┴─────────────────────────────────┘
├─────────────────────────────────────────────────────────────────┤
│ SYSTEM HEALTH                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Server: ● Online | Database: ● Connected | Redis: ● Active │ │
│ │ Uptime: 99.9% | Response Time: 45ms | Error Rate: 0.02%    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10.2 User Management

**Purpose:** Manage all platform users

**Page:** `/admin/users`

**Status:** 🚧 Planned

### Planned Features

| Feature          | Description            | Priority |
| ---------------- | ---------------------- | -------- |
| User List        | Browse all users       | High     |
| Search & Filter  | Find specific users    | High     |
| User Detail View | View user information  | High     |
| Edit User        | Modify user data       | High     |
| Suspend/Activate | Account status control | High     |
| Role Management  | Assign/revoke roles    | High     |
| Merge Accounts   | Combine duplicates     | Low      |
| Password Reset   | Force reset for users  | Medium   |
| Verification     | Manage verification    | Medium   |
| Activity Logs    | View user actions      | Medium   |

### User Filters

| Filter     | Options                        |
| ---------- | ------------------------------ |
| Role       | All, Consumer, Merchant, Admin |
| Status     | Active, Suspended, Pending     |
| Verified   | Verified, Unverified           |
| Campus     | All campuses                   |
| Date Range | Registration period            |

### User Actions

| Action         | Description           |
| -------------- | --------------------- |
| View           | See full profile      |
| Edit           | Modify user data      |
| Suspend        | Disable account       |
| Activate       | Re-enable account     |
| Change Role    | Assign roles          |
| Reset Password | Force password reset  |
| Delete         | Remove account        |
| Impersonate    | Login as user (debug) |

### Planned Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ User Management                           [+ Create User]       │
├─────────────────────────────────────────────────────────────────┤
│ Search: [_______________] Role: [All ▾] Status: [All ▾]        │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────┬─────────────┬───────────────────┬────────┬───────────┐ │
│ │ ID   │ User        │ Email             │ Role   │ Status    │ │
│ ├──────┼─────────────┼───────────────────┼────────┼───────────┤ │
│ │ 001  │ John Doe    │ john@uitm.edu.my  │Consumer│ ● Active  │ │
│ │ 002  │ Jane Smith  │ jane@uitm.edu.my  │Merchant│ ● Active  │ │
│ │ 003  │ Bob Wilson  │ bob@uitm.edu.my   │Consumer│ ○ Suspended│ │
│ └──────┴─────────────┴───────────────────┴────────┴───────────┘ │
│                                                                  │
│ Showing 1-10 of 5,420 users    [< Prev] [1] [2] [3] [Next >]   │
└─────────────────────────────────────────────────────────────────┘
```

### User Detail Panel

```
┌─────────────────────────────────────────────────────────────────┐
│ User: John Doe                                           [Edit] │
├─────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Basic Information                                          │  │
│ │ Email: john@uitm.edu.my (Verified ✓)                       │  │
│ │ Phone: 012-345-6789                                        │  │
│ │ Campus: Shah Alam                                          │  │
│ │ Registered: Jan 1, 2024                                    │  │
│ │ Last Active: 5 minutes ago                                 │  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │ Roles: [Consumer] [Merchant]              [Manage Roles]   │  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │ Statistics                                                 │  │
│ │ Orders: 25 | Sales: 150 | Listings: 45 | Rating: ★★★★☆   │  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │ Actions                                                    │  │
│ │ [Reset Password] [Suspend Account] [Delete Account]        │  │
│ └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10.3 Content Moderation

**Purpose:** Review and moderate platform content

**Page:** `/admin/moderation`

**Status:** 🚧 Planned

### Planned Features

| Feature           | Description                  | Priority |
| ----------------- | ---------------------------- | -------- |
| Reported Listings | Review flagged listings      | High     |
| Reported Shops    | Review flagged merchants     | High     |
| Reported Users    | Review flagged accounts      | High     |
| Approval Workflow | Content approval queue       | Medium   |
| Takedown          | Remove inappropriate content | High     |
| Warning System    | Issue warnings to users      | Medium   |
| Ban Management    | User bans and appeals        | Medium   |

### Report Types

| Type    | Description                |
| ------- | -------------------------- |
| Listing | Inappropriate/fake product |
| Shop    | Fraudulent merchant        |
| User    | Harassment/abuse           |
| Review  | Fake/malicious review      |
| Message | Spam/harassment            |

### Report Statuses

| Status       | Description         |
| ------------ | ------------------- |
| Pending      | Awaiting review     |
| Under Review | Being investigated  |
| Resolved     | Action taken        |
| Dismissed    | No action needed    |
| Escalated    | Needs senior review |

### Moderation Actions

| Action   | Applies To | Description    |
| -------- | ---------- | -------------- |
| Approve  | Content    | Allow content  |
| Remove   | Content    | Delete content |
| Warn     | User       | Issue warning  |
| Suspend  | User       | Temporary ban  |
| Ban      | User       | Permanent ban  |
| Escalate | Any        | Senior review  |

### Planned Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Content Moderation                                               │
├─────────────────────────────────────────────────────────────────┤
│ [All (25)] [Listings (12)] [Shops (5)] [Users (8)]              │
├─────────────────────────────────────────────────────────────────┤
│ Status: [Pending ▾]  Priority: [All ▾]  Sort: [Newest ▾]       │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🚩 LISTING REPORT                        Priority: High    │ │
│ │ ────────────────────────────────────────────────────────── │ │
│ │ Listing: "iPhone 15 Pro Max" by Shop XYZ                   │ │
│ │ Reported by: 3 users                                       │ │
│ │ Reason: Suspected counterfeit product                      │ │
│ │ Date: Jan 1, 2026 10:30 AM                                 │ │
│ │                                                             │ │
│ │ [View Listing] [View Reports] [Approve] [Remove] [Warn]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🚩 USER REPORT                           Priority: Medium  │ │
│ │ ────────────────────────────────────────────────────────── │ │
│ │ User: @badactor123                                         │ │
│ │ Reported by: 2 users                                       │ │
│ │ Reason: Harassment in messages                             │ │
│ │ Date: Dec 31, 2025 3:45 PM                                 │ │
│ │                                                             │ │
│ │ [View Profile] [View Reports] [Warn] [Suspend] [Ban]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10.4 Platform Settings

**Purpose:** Configure platform-wide settings

**Page:** `/admin/settings`

**Status:** 🚧 Planned

### Planned Features

| Feature          | Description             | Priority |
| ---------------- | ----------------------- | -------- |
| General Settings | Basic platform config   | High     |
| Payment Config   | Stripe settings         | High     |
| Email Templates  | Notification templates  | Medium   |
| Feature Toggles  | Enable/disable features | Medium   |
| Maintenance Mode | Platform maintenance    | High     |
| Announcements    | System-wide alerts      | Medium   |
| Terms & Policies | Legal documents         | Low      |
| Rate Limits      | API throttling config   | Medium   |

### Settings Categories

#### General Settings

| Setting          | Description           |
| ---------------- | --------------------- |
| Platform Name    | Site name             |
| Contact Email    | Support email         |
| Support Phone    | Contact number        |
| Default Currency | RM                    |
| Time Zone        | Malaysia/Kuala Lumpur |
| Language         | Default language      |

#### Payment Settings

| Setting         | Description           |
| --------------- | --------------------- |
| Stripe Mode     | Test/Live             |
| Platform Fee    | Commission percentage |
| COD Limits      | Min/max amounts       |
| Payout Schedule | Merchant payouts      |

#### Feature Toggles

| Feature         | Toggle         |
| --------------- | -------------- |
| Registration    | Enable/disable |
| COD Payment     | Enable/disable |
| Merchant Signup | Enable/disable |
| Reviews         | Enable/disable |
| Wishlist        | Enable/disable |

#### Maintenance Mode

| Option       | Description          |
| ------------ | -------------------- |
| Enable       | Turn on maintenance  |
| Message      | Custom message       |
| Allowed IPs  | Admin access         |
| Expected End | Estimated completion |

### Planned Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Platform Settings                                                │
├─────────────────────────────────────────────────────────────────┤
│ [General] [Payment] [Email] [Features] [Security] [Advanced]   │
├─────────────────────────────────────────────────────────────────┤
│ GENERAL SETTINGS                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Platform Name:     [UiTM Marketplace_______________]       │ │
│ │ Contact Email:     [support@uitm-marketplace.com__]        │ │
│ │ Support Phone:     [03-1234-5678___________________]       │ │
│ │ Default Currency:  [MYR (RM) ▾_____________________]       │ │
│ │ Time Zone:         [Asia/Kuala_Lumpur ▾____________]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ FEATURE TOGGLES                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ New User Registration    [●━━━━━━━━━━━] ON                 │ │
│ │ Merchant Registration    [●━━━━━━━━━━━] ON                 │ │
│ │ Cash on Delivery         [●━━━━━━━━━━━] ON                 │ │
│ │ Product Reviews          [━━━━━━━━━━━○] OFF (Coming Soon)  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                              [Reset to Defaults] [Save Changes] │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints (Planned)

### Dashboard

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| `GET`  | `/api/admin/dashboard` | Dashboard overview   |
| `GET`  | `/api/admin/stats`     | Platform statistics  |
| `GET`  | `/api/admin/health`    | System health status |

### User Management

| Method   | Endpoint                        | Description    |
| -------- | ------------------------------- | -------------- |
| `GET`    | `/api/admin/users`              | List all users |
| `GET`    | `/api/admin/users/:id`          | User details   |
| `PATCH`  | `/api/admin/users/:id`          | Update user    |
| `POST`   | `/api/admin/users/:id/suspend`  | Suspend user   |
| `POST`   | `/api/admin/users/:id/activate` | Activate user  |
| `DELETE` | `/api/admin/users/:id`          | Delete user    |

### Content Moderation

| Method  | Endpoint                         | Description    |
| ------- | -------------------------------- | -------------- |
| `GET`   | `/api/admin/reports`             | List reports   |
| `GET`   | `/api/admin/reports/:id`         | Report details |
| `PATCH` | `/api/admin/reports/:id`         | Update report  |
| `POST`  | `/api/admin/reports/:id/resolve` | Resolve report |

### Settings

| Method  | Endpoint                 | Description        |
| ------- | ------------------------ | ------------------ |
| `GET`   | `/api/admin/settings`    | Get settings       |
| `PATCH` | `/api/admin/settings`    | Update settings    |
| `POST`  | `/api/admin/maintenance` | Toggle maintenance |

---

## Related Files (Planned)

### Client-Side

- `client/src/pages/admin/Dashboard.js`
- `client/src/pages/admin/Users.js`
- `client/src/pages/admin/Moderation.js`
- `client/src/pages/admin/Settings.js`

### Server-Side

- `server/controllers/admin/`
- `server/middleware/admin.middleware.js`
- `server/models/Report.js`
- `server/models/Settings.js`

---

[← Previous: Analytics](./09-analytics.md) | [Back to Index](./README.md) | [Next: Search & Notifications →](./11-search-notifications.md)
