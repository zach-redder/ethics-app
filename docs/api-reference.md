# API Reference

Complete reference for all service methods in the Ethics App.

## Authentication Service

Located at: `src/services/authService.js`

### authService.signUp(email, password, metadata)

Create a new user account.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password
- `metadata` (object, optional): Additional user data

**Returns:** `{ data, error }`

**Example:**
```javascript
const { data, error } = await authService.signUp(
  'user@example.com',
  'securePassword123',
  { full_name: 'John Doe' }
);
```

### authService.signIn(email, password)

Sign in an existing user.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password

**Returns:** `{ data, error }`

**Example:**
```javascript
const { data, error } = await authService.signIn(
  'user@example.com',
  'securePassword123'
);
```

### authService.signOut()

Sign out the current user.

**Returns:** `{ error }`

**Example:**
```javascript
const { error } = await authService.signOut();
```

### authService.getSession()

Get the current session.

**Returns:** `{ data, error }`

**Example:**
```javascript
const { data, error } = await authService.getSession();
const session = data.session;
```

### authService.getCurrentUser()

Get the current authenticated user.

**Returns:** `{ user, error }`

**Example:**
```javascript
const { user, error } = await authService.getCurrentUser();
```

### authService.resetPassword(email)

Send password reset email.

**Parameters:**
- `email` (string): User's email address

**Returns:** `{ data, error }`

**Example:**
```javascript
const { data, error } = await authService.resetPassword('user@example.com');
```

### authService.updatePassword(newPassword)

Update user's password.

**Parameters:**
- `newPassword` (string): New password

**Returns:** `{ data, error }`

**Example:**
```javascript
const { data, error } = await authService.updatePassword('newSecurePassword123');
```

### authService.onAuthStateChange(callback)

Listen to authentication state changes.

**Parameters:**
- `callback` (function): Callback function

**Returns:** Subscription object

**Example:**
```javascript
const subscription = authService.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session);
});

// Cleanup
subscription.unsubscribe();
```

---

## User Service

Located at: `src/services/userService.js`

### userService.getProfile(userId)

Get user profile by ID.

**Parameters:**
- `userId` (string): User's UUID

**Returns:** `{ data, error }`

**Example:**
```javascript
const { data, error } = await userService.getProfile(userId);
```

### userService.upsertProfile(userId, profileData)

Create or update user profile.

**Parameters:**
- `userId` (string): User's UUID
- `profileData` (object): Profile data

**Returns:** `{ data, error }`

**Example:**
```javascript
const { data, error } = await userService.upsertProfile(userId, {
  username: 'johndoe',
  full_name: 'John Doe',
  bio: 'Software developer',
});
```

### userService.updateProfile(userId, updates)

Update specific profile fields.

**Parameters:**
- `userId` (string): User's UUID
- `updates` (object): Fields to update

**Returns:** `{ data, error }`

**Example:**
```javascript
const { data, error } = await userService.updateProfile(userId, {
  bio: 'Updated bio',
});
```

### userService.deleteProfile(userId)

Delete user profile.

**Parameters:**
- `userId` (string): User's UUID

**Returns:** `{ error }`

**Example:**
```javascript
const { error } = await userService.deleteProfile(userId);
```

### userService.getProfiles(filters, limit, offset)

Get multiple profiles with pagination.

**Parameters:**
- `filters` (object, optional): Query filters
- `limit` (number, optional): Number of results (default: 10)
- `offset` (number, optional): Pagination offset (default: 0)

**Returns:** `{ data, count, error }`

**Example:**
```javascript
const { data, count, error } = await userService.getProfiles(
  { status: 'active' },
  20,
  0
);
```

### userService.searchProfiles(searchTerm)

Search profiles by username or email.

**Parameters:**
- `searchTerm` (string): Search query

**Returns:** `{ data, error }`

**Example:**
```javascript
const { data, error } = await userService.searchProfiles('john');
```

### userService.subscribeToProfile(userId, callback)

Subscribe to real-time profile changes.

**Parameters:**
- `userId` (string): User's UUID
- `callback` (function): Callback for changes

**Returns:** Subscription object

**Example:**
```javascript
const subscription = userService.subscribeToProfile(userId, (payload) => {
  console.log('Profile changed:', payload);
});

// Cleanup
await supabase.removeChannel(subscription);
```

---

## Example Service

Located at: `src/services/exampleService.js`

Template for creating services for other tables. Methods follow the same pattern:

- `create(itemData)` - Create new item
- `getById(id)` - Get single item
- `getAll(filters, limit, offset)` - Get multiple items
- `update(id, updates)` - Update item
- `delete(id)` - Delete item
- `getByUserId(userId)` - Get items by user
- `subscribe(callback, filter)` - Real-time subscription
- `unsubscribe(subscription)` - Unsubscribe

---

## Custom Hooks

### useAuth()

Located at: `src/hooks/useAuth.js`

Custom hook for authentication management.

**Returns:**
```javascript
{
  user,           // Current user object
  session,        // Current session
  loading,        // Loading state
  signIn,         // Sign in function
  signUp,         // Sign up function
  signOut,        // Sign out function
  isAuthenticated // Boolean authentication status
}
```

**Example:**
```javascript
import { useAuth } from '../hooks';

function MyComponent() {
  const { user, loading, signOut, isAuthenticated } = useAuth();

  if (loading) return <Text>Loading...</Text>;
  if (!isAuthenticated) return <Text>Not logged in</Text>;

  return <Text>Welcome, {user.email}</Text>;
}
```

---

## Utility Functions

### Validation Utils

Located at: `src/utils/validation.js`

- `validation.isValidEmail(email)` - Validate email format
- `validation.isValidPassword(password)` - Validate password strength
- `validation.isValidUsername(username)` - Validate username
- `validation.isRequired(value, fieldName)` - Check required field

### Formatter Utils

Located at: `src/utils/formatters.js`

- `formatters.formatDate(date)` - Format date
- `formatters.formatDateTime(date)` - Format date and time
- `formatters.formatRelativeTime(date)` - Format relative time (e.g., "2 hours ago")
- `formatters.truncateText(text, maxLength)` - Truncate text with ellipsis
- `formatters.formatNumber(num)` - Format number with commas
- `formatters.formatCurrency(amount, currency)` - Format currency

---

## Error Handling

All service methods return errors in a consistent format:

```javascript
const { data, error } = await someService.someMethod();

if (error) {
  console.error('Error:', error.message);
  // Handle error
} else {
  // Use data
}
```

Common error types:
- Authentication errors (invalid credentials, user not found)
- Authorization errors (RLS policy violations)
- Validation errors (invalid data format)
- Network errors (connection issues)

---

## Best Practices

1. Always check for errors before using data
2. Use try-catch blocks for error handling
3. Clean up subscriptions when component unmounts
4. Use the useAuth hook for authentication state
5. Validate user input before submitting
6. Handle loading states in UI
7. Provide meaningful error messages to users
