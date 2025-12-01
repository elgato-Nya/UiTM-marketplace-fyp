# Testing Documentation

## Overview

This project uses **Jest** with **MongoDB Memory Server** for fast, isolated testing. All tests run in-memory without external dependencies.

**Test Status**: ✅ **316 tests passing** (100% pass rate)

---

## Test Structure

```
tests/
├── unit/                    # Isolated unit tests
│   ├── validators/          # Input validation logic (184 tests)
│   └── config/              # Configuration tests
├── integration/             # Database integration tests
│   └── models/              # Model tests with real DB (120+ tests)
└── e2e/                     # End-to-end tests (planned)
```

---

## Test Categories

### 1. Unit Tests (Validators)

**Purpose**: Test pure functions without database  
**Files**: 7 validator test files  
**Tests**: 184 tests

**Coverage**:

- ✅ User validation (email, password, username, phone)
- ✅ Address validation (campus, personal addresses)
- ✅ Cart validation (item quantities, limits)
- ✅ Wishlist validation (item limits)
- ✅ Order validation (amounts, status)
- ✅ Listing validation (products, services)
- ✅ Checkout validation (session data)

**Example**:

```javascript
// tests/unit/validators/user.validator.test.js
it("should validate UiTM email", () => {
  expect(isValidUiTMEmail("student@student.uitm.edu.my")).toBe(true);
  expect(isValidUiTMEmail("user@gmail.com")).toBe(false);
});
```

---

### 2. Integration Tests (Models)

**Purpose**: Test models with real MongoDB operations  
**Files**: 7 model test files  
**Tests**: 120+ tests

**Coverage**:
| Model | Tests | Key Features Tested |
|-------|-------|---------------------|
| **Cart** | 16 | Item limit (50), CRUD operations, virtual properties |
| **Wishlist** | 11 | Item limit (250), duplicates, price tracking |
| **Order** | 7 | Auto-generated orderNumber, payment/delivery methods |
| **Listing** | 18 | Products vs services, validation, seller info |
| **Analytics** | 17 | Merchant & platform metrics, growth rates |
| **User** | ✅ | Authentication, profiles, roles |
| **Address** | ✅ | Campus & personal addresses |

**Example**:

```javascript
// tests/integration/models/cart.model.test.js
it("should enforce cart limit (50 items)", async () => {
  // Create 50 listings and add to cart
  for (let i = 0; i < 50; i++) {
    cart.addOrUpdateItem(listings[i]._id, 1);
  }
  await cart.save();

  // Try to add 51st item - should throw error
  expect(() => cart.addOrUpdateItem(extraListing._id, 1)).toThrow("limit");
});
```

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- tests/unit/validators/user.validator.test.js
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

---

## Test Configuration

**Jest Config** (`jest.config.js`):

```javascript
{
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.env.js"],
  testMatch: ["**/*.test.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
}
```

**Environment Setup** (`jest.env.js`):

- Sets `NODE_ENV=test`
- Configures test database
- Loads test environment variables

---

## Key Testing Patterns

### 1. Database Isolation

Each test file creates its own MongoDB Memory Server:

```javascript
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

### 2. Clean State Between Tests

```javascript
beforeEach(async () => {
  await Model.deleteMany({});
  // Create fresh test data
});
```

### 3. Test User Factory

```javascript
const createTestUser = async () => {
  return await User.create({
    email: "test@student.uitm.edu.my",
    password: "SecurePass123!",
    profile: {
      username: "testuser99", // 6-16 chars
      phoneNumber: "01234567890", // 11 digits
      campus: "SHAH_ALAM", // Enum KEY not value
      faculty: "COMPUTER_SCIENCE_MATH",
    },
  });
};
```

---

## Important Schema Notes

### Enum Values (Use KEYS not VALUES)

❌ Wrong:

```javascript
campus: "UiTM Shah Alam"; // Human-readable value
```

✅ Correct:

```javascript
campus: "SHAH_ALAM"; // Enum key
```

### Username Validation

- **Length**: 6-16 characters
- **Start**: Must start with letter or number
- **Allowed**: Letters, numbers, underscores, hyphens

### Cart & Wishlist Limits

- **Cart**: Maximum 50 items
- **Wishlist**: Maximum 250 items

### Order Model

- `orderNumber`: Auto-generated (ORD-YYYYMMDD-XXXXXX)
- `seller.name`: Required field (not `seller.username`)
- Payment methods: `"cod"`, `"bank_transfer"`, `"e_wallet"`, `"credit_card"`

---

## Test Optimization History

### Before Optimization

- **658 total tests**
- **60% redundancy** (validators tested 3x, models tested 2x)
- Slow execution due to duplicate tests

### After Optimization

- **316 total tests** (52% reduction)
- **0% redundancy** (clean separation: validators vs models)
- Fast execution with isolated tests

### Changes Made

1. ✅ Deleted 416 redundant unit model tests
2. ✅ Moved all validators to `tests/unit/validators/`
3. ✅ Created proper integration tests in `tests/integration/models/`
4. ✅ Each test file now tests ONE responsibility

---

## Troubleshooting

### Common Issues

**Issue**: "ValidationError: Invalid campus value"  
**Solution**: Use enum KEY not VALUE (`"SHAH_ALAM"` not `"UiTM Shah Alam"`)

**Issue**: "Username must be between 6 and 16 characters"  
**Solution**: Ensure username is 6-16 chars and starts with letter/number

**Issue**: "Cart limit reached"  
**Solution**: Cart has MAX 50 items, Wishlist has MAX 250 items

**Issue**: Tests hanging/timeout  
**Solution**: Ensure `afterAll` properly disconnects MongoDB

---

## Future Improvements

- [ ] Add E2E tests for critical flows (auth, checkout, merchant)
- [ ] Add performance tests for large datasets
- [ ] Add controller/service layer tests
- [ ] Increase test coverage to 90%+
- [ ] Add API integration tests with supertest

---

## Contributing

When adding new tests:

1. ✅ Use MongoDB Memory Server for isolation
2. ✅ Clean up database in `beforeEach`
3. ✅ Use proper enum keys (not values)
4. ✅ Follow existing naming patterns
5. ✅ Keep tests focused and independent

---

**Last Updated**: November 23, 2025  
**Test Framework**: Jest v30.0.5  
**Test Status**: ✅ 316/316 passing (100%)
