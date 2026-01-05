# Profile Management

> User profile, address management, and security settings

[← Back to Features Index](./README.md)

---

## Overview

The profile management system allows users to view and edit their personal information, manage delivery addresses, and configure security settings.

## Table of Contents

- [7.1 User Profile](#71-user-profile)
- [7.2 Address Management](#72-address-management)
- [7.3 Security Settings](#73-security-settings)

---

## 7.1 User Profile

**Purpose:** View and edit personal information

**Page:** `/profile`

**Access:** Login required

### Key Features

| Feature             | Description                |
| ------------------- | -------------------------- |
| Profile Display     | View personal information  |
| Avatar Upload       | Profile picture management |
| Inline Editing      | Quick field updates        |
| Account Stats       | Activity statistics        |
| Role Badges         | Consumer/Merchant/Admin    |
| Verification Status | Email verified indicator   |
| Last Active         | Activity timestamp         |
| Profile Completion  | Progress indicator         |

### User Capabilities

- View profile details
- Update avatar image
- Edit username (with availability check)
- Edit bio (250 chars max)
- Edit phone number
- Change campus selection
- Update faculty
- See account statistics
- Navigate to other profile sections

### Account Statistics

| Stat         | Description             |
| ------------ | ----------------------- |
| Member Since | Registration date       |
| Total Orders | Purchase count (buyer)  |
| Total Sales  | Order count (merchant)  |
| Rating       | Average customer rating |
| Verification | Email verified status   |

### Profile Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ My Profile                                                       │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────┬────────────────────────────────┐
│ │                              │                                │
│ │     ┌────────────────┐       │ Username: john_doe [✏️]        │
│ │     │                │       │ Email: john@uitm.edu.my ✓      │
│ │     │    [Avatar]    │       │ Bio: UiTM student... [✏️]      │
│ │     │                │       │ Phone: 012-345-6789 [✏️]       │
│ │     └────────────────┘       │ Campus: Shah Alam [✏️]         │
│ │     [📷 Change Photo]        │ Faculty: Computer Science [✏️] │
│ │                              │                                │
│ │     ┌────────┐ ┌────────┐   │ Roles:                         │
│ │     │Consumer│ │Merchant│   │ [Consumer] [Merchant]          │
│ │     └────────┘ └────────┘   │                                │
│ └──────────────────────────────┴────────────────────────────────┘
├─────────────────────────────────────────────────────────────────┤
│ ACCOUNT STATISTICS                                               │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐       │
│ │ Member      │ Total       │ Total       │ Rating      │       │
│ │ Since       │ Orders      │ Sales       │             │       │
│ │ Jan 2024    │ 25          │ 150         │ ★★★★☆ 4.5   │       │
│ └─────────────┴─────────────┴─────────────┴─────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│ QUICK LINKS                                                      │
│ [📍 Manage Addresses] [🔒 Security] [⚙️ Settings]               │
│ [📦 My Orders] [🏪 Merchant Dashboard]                          │
├─────────────────────────────────────────────────────────────────┤
│ Last active: 5 minutes ago                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Editable Fields

| Field    | Requirements     | Validation           |
| -------- | ---------------- | -------------------- |
| Avatar   | Square, max 2MB  | JPG, PNG, WebP       |
| Username | 4-15 characters  | Unique, alphanumeric |
| Bio      | Max 250 chars    | No HTML              |
| Phone    | Malaysian format | 01X-XXX-XXXX         |
| Campus   | Dropdown         | Valid campus enum    |
| Faculty  | Dropdown         | Valid faculty enum   |

### Non-Editable Fields

| Field        | Reason                          |
| ------------ | ------------------------------- |
| Email        | Requires verification to change |
| Member Since | Registration timestamp          |
| Account ID   | System-generated                |
| Role         | Admin modification only         |

### Profile Completion

```
Profile Completion: 85%
━━━━━━━━━━━━━━━━░░░

Missing:
☐ Add profile bio
☐ Verify phone number
```

### Technical Implementation

| Feature           | Implementation             |
| ----------------- | -------------------------- |
| Inline Editing    | Click to edit pattern      |
| Optimistic UI     | Instant visual feedback    |
| Image Upload      | S3 with pre-signed URLs    |
| Image Cropping    | Client-side crop tool      |
| Username Check    | Debounced availability API |
| Completion Calc   | Field presence scoring     |
| Real-time Updates | Redux state sync           |
| Audit Logging     | Change history tracking    |

---

## 7.2 Address Management

**Purpose:** Manage delivery and billing addresses

**Page:** `/profile/addresses`

**Access:** Login required

### Key Features

| Feature            | Description              |
| ------------------ | ------------------------ |
| Multiple Types     | Campus, Personal, Pickup |
| Add Addresses      | Create new addresses     |
| Edit Addresses     | Modify existing          |
| Delete Addresses   | Remove unused            |
| Default Setting    | One default per type     |
| Address Validation | Format checking          |
| Quick Selection    | Fast checkout use        |

### Address Types

#### Campus Address

| Field        | Required | Description       |
| ------------ | -------- | ----------------- |
| Campus       | Yes      | University campus |
| Building     | Yes      | Building name     |
| Floor        | No       | Floor number      |
| Room/Unit    | Yes      | Room number       |
| Instructions | No       | Delivery notes    |

#### Personal Address

| Field          | Required | Description         |
| -------------- | -------- | ------------------- |
| Address Line 1 | Yes      | Street address      |
| Address Line 2 | No       | Apt, suite, etc.    |
| City           | Yes      | City name           |
| State          | Yes      | State/region        |
| Postcode       | Yes      | 5-digit postal code |
| Country        | Yes      | Default: Malaysia   |

#### Pickup Point

| Field           | Required | Description           |
| --------------- | -------- | --------------------- |
| Location        | Yes      | Pickup location       |
| Time Preference | No       | Preferred pickup time |
| Instructions    | No       | Contact instructions  |

### User Capabilities

- Add new address (any type)
- View all saved addresses
- Edit any address
- Delete addresses (except default)
- Set default per type
- Validate address format
- Use address in checkout
- Label addresses (Home, Dorm, etc.)

### Address Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ My Addresses                              [+ Add New Address]   │
├─────────────────────────────────────────────────────────────────┤
│ [All] [Campus (2)] [Personal (1)] [Pickup (1)]                  │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🏫 Campus Address                              ⭐ Default   │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ "My Dorm"                                                   │ │
│ │ Building A, Floor 3, Room 301                              │ │
│ │ UiTM Shah Alam                                             │ │
│ │ 📞 012-345-6789                                            │ │
│ │                                                             │ │
│ │ [✏️ Edit] [🗑️ Delete] [Set as Default]                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🏠 Personal Address                                         │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ "Home"                                                      │ │
│ │ 123 Jalan Example, Taman ABC                               │ │
│ │ 40000 Shah Alam, Selangor                                  │ │
│ │ 📞 012-345-6789                                            │ │
│ │                                                             │ │
│ │ [✏️ Edit] [🗑️ Delete] [Set as Default]                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Empty state shows when no addresses exist                       │
└─────────────────────────────────────────────────────────────────┘
```

### Add/Edit Address Form

```
┌─────────────────────────────────────────────────────────────────┐
│ Add New Address                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Address Type: (○) Campus  (●) Personal  (○) Pickup              │
├─────────────────────────────────────────────────────────────────┤
│ Label (optional): [Home_________________________]               │
│                                                                  │
│ Address Line 1: [123 Jalan Example_____________] *              │
│ Address Line 2: [Taman ABC_____________________]                │
│ City:           [Shah Alam_____________________] *              │
│ State:          [Selangor ▾___________________] *               │
│ Postcode:       [40000_________________________] *              │
│                                                                  │
│ Recipient Name: [John Doe______________________] *              │
│ Phone Number:   [012-345-6789__________________] *              │
│                                                                  │
│ ☐ Set as default address                                        │
├─────────────────────────────────────────────────────────────────┤
│                              [Cancel] [Save Address]            │
└─────────────────────────────────────────────────────────────────┘
```

### Validations

| Field           | Validation        |
| --------------- | ----------------- |
| Required Fields | Must not be empty |
| Phone Number    | Malaysian format  |
| Postcode        | 5-digit format    |
| Building/Room   | Campus addresses  |
| Pickup Time     | Must be future    |

### Technical Implementation

| Feature       | Implementation               |
| ------------- | ---------------------------- |
| Storage       | Embedded documents in User   |
| Validation    | Type-based conditional rules |
| Default Logic | One per address type         |
| Formatting    | Address string utilities     |
| Geocoding     | Future enhancement           |
| Autocomplete  | Google Places API (future)   |

---

## 7.3 Security Settings

**Purpose:** Manage account security

**Page:** `/profile/security`

**Access:** Login required

**Status:** 🚧 Future Enhancement

### Planned Features

| Feature              | Description             | Status  |
| -------------------- | ----------------------- | ------- |
| Change Password      | Update current password | Planned |
| Two-Factor Auth      | SMS/TOTP 2FA            | Planned |
| Active Sessions      | View/manage sessions    | Planned |
| Login History        | Recent login attempts   | Planned |
| Trusted Devices      | Device management       | Planned |
| Security Alerts      | Email notifications     | Planned |
| Account Deactivation | Disable account         | Planned |

### Planned Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Security Settings                                                │
├─────────────────────────────────────────────────────────────────┤
│ PASSWORD                                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Last changed: 30 days ago                                   │ │
│ │                                          [Change Password]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ TWO-FACTOR AUTHENTICATION                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Status: ❌ Not Enabled                                      │ │
│ │ Add extra security to your account                          │ │
│ │                                               [Enable 2FA]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ACTIVE SESSIONS                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🖥️ Windows • Chrome • Shah Alam (Current)                   │ │
│ │    Last active: Now                                         │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 📱 Android • Chrome • Kuala Lumpur                          │ │
│ │    Last active: 2 hours ago               [End Session]     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                       [End All Other Sessions]  │
├─────────────────────────────────────────────────────────────────┤
│ DANGER ZONE                                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Deactivate Account]                                        │ │
│ │ This will disable your account and hide your data           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Change Password Flow

```
Current Password: [••••••••••••••••]
New Password:     [••••••••••••••••]
                  ✓ At least 8 characters
                  ✓ Uppercase letter
                  ✓ Lowercase letter
                  ✓ Number
                  ✓ Special character
Confirm Password: [••••••••••••••••]
                  ✓ Passwords match

[Cancel] [Update Password]
```

---

## API Endpoints

| Method   | Endpoint                   | Description         |
| -------- | -------------------------- | ------------------- |
| `GET`    | `/api/users/profile`       | Get user profile    |
| `PATCH`  | `/api/users/profile`       | Update profile      |
| `POST`   | `/api/users/avatar`        | Upload avatar       |
| `DELETE` | `/api/users/avatar`        | Remove avatar       |
| `GET`    | `/api/users/addresses`     | Get addresses       |
| `POST`   | `/api/users/addresses`     | Add address         |
| `PATCH`  | `/api/users/addresses/:id` | Update address      |
| `DELETE` | `/api/users/addresses/:id` | Delete address      |
| `PATCH`  | `/api/users/password`      | Change password     |
| `GET`    | `/api/users/sessions`      | Get active sessions |
| `DELETE` | `/api/users/sessions/:id`  | End session         |

---

## Related Files

### Client-Side

- `client/src/pages/profile/Profile.js` - Profile page
- `client/src/pages/profile/Addresses.js` - Address management
- `client/src/pages/profile/Security.js` - Security settings
- `client/src/components/profile/` - Profile components
- `client/src/store/slices/profileSlice.js` - Profile state

### Server-Side

- `server/controllers/user/` - User controllers
- `server/models/User.js` - User model
- `server/validators/user.validator.js` - Validation rules
- `server/middleware/auth.middleware.js` - Auth checks

---

[← Previous: Order Management](./06-order-management.md) | [Back to Index](./README.md) | [Next: Merchant Features →](./08-merchant-features.md)
