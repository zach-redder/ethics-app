# Folder Structure

This document explains the organization and purpose of each folder in the Ethics App.

## Project Root

```
ethics-app/
├── src/                 # Source code
├── assets/             # Static assets (images, fonts, etc.)
├── docs/               # Project documentation
├── __tests__/          # Test files
├── node_modules/       # Dependencies (auto-generated)
├── .env                # Environment variables (not in git)
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
├── app.json            # Expo configuration
├── App.js              # Main app entry point
├── index.js            # App registration
├── package.json        # Project dependencies and scripts
└── package-lock.json   # Locked dependency versions
```

## src/ Directory

The main source code directory following feature-based organization:

### src/components/

Reusable UI components used across multiple screens.

```
src/components/
├── Button.js           # Reusable button component
├── Input.js            # Reusable input component
└── index.js            # Central export point
```

**Purpose:**
- Contains presentational components
- Should be generic and reusable
- Accepts props for customization
- Minimal business logic

**When to add a component here:**
- When a UI element is used in multiple places
- When you want to maintain consistent styling
- When creating a reusable pattern

### src/screens/

Full-page screen components representing different app views.

```
src/screens/
├── LoginScreen.js      # Login/signup screen
├── HomeScreen.js       # Main home screen
├── ProfileScreen.js    # User profile screen
└── index.js            # Central export point
```

**Purpose:**
- One file per screen
- Contains screen-specific logic
- Uses components from src/components/
- Handles navigation

**Naming convention:** `[ScreenName]Screen.js`

### src/services/

Business logic and API integrations, primarily Supabase operations.

```
src/services/
├── supabase.js         # Supabase client configuration
├── authService.js      # Authentication operations
├── userService.js      # User profile operations
├── exampleService.js   # Template for other services
└── index.js            # Central export point
```

**Purpose:**
- API calls to Supabase
- Database operations (CRUD)
- Authentication logic
- Real-time subscriptions
- Business logic

**Pattern:**
Each service exports an object with methods:
```javascript
export const serviceName = {
  create: async () => {},
  getById: async () => {},
  update: async () => {},
  delete: async () => {},
};
```

### src/navigation/

Navigation configuration and routing setup.

```
src/navigation/
├── AppNavigator.js     # Main navigation structure
├── AuthNavigator.js    # Auth-specific navigation
└── index.js            # Central export point
```

**Purpose:**
- Define app navigation structure
- Configure navigation options
- Set up navigation stacks/tabs/drawers
- Handle deep linking

**Note:** Currently empty - add when implementing React Navigation

### src/hooks/

Custom React hooks for reusable stateful logic.

```
src/hooks/
├── useAuth.js          # Authentication state hook
└── index.js            # Central export point
```

**Purpose:**
- Reusable stateful logic
- Abstract complex state management
- Share logic between components

**Naming convention:** `use[HookName].js`

**Example hooks to add:**
- `useDebounce.js` - Debounce values
- `useFetch.js` - Data fetching
- `useForm.js` - Form state management

### src/utils/

Pure utility functions and helpers.

```
src/utils/
├── validation.js       # Input validation functions
├── formatters.js       # Data formatting functions
└── index.js            # Central export point
```

**Purpose:**
- Pure functions (no side effects)
- Data transformation
- Validation logic
- Formatting helpers

**When to add utilities:**
- When you have pure functions used in multiple places
- For data manipulation
- For validation logic

### src/constants/

Application-wide constants and configuration.

```
src/constants/
├── theme.js            # Theme colors, sizes, fonts
└── index.js            # Central export point
```

**Purpose:**
- Theme configuration
- App-wide constants
- Configuration values
- Enum-like values

**Example constants to add:**
- API endpoints
- Feature flags
- App configuration
- Static data

### src/types/

TypeScript type definitions (if using TypeScript).

```
src/types/
├── auth.ts             # Authentication types
├── user.ts             # User types
└── index.ts            # Central export point
```

**Purpose:**
- TypeScript interfaces
- Type definitions
- Shared types across the app

**Note:** Currently empty - add when migrating to TypeScript

## assets/ Directory

Static assets like images, fonts, icons, etc.

```
assets/
├── images/             # Image files
├── fonts/              # Custom fonts
├── icons/              # Icon files
├── adaptive-icon.png   # Expo adaptive icon
├── favicon.png         # Web favicon
├── icon.png            # App icon
└── splash.png          # Splash screen
```

## docs/ Directory

Project documentation for reference.

```
docs/
├── README.md           # Documentation overview
├── setup-guide.md      # Setup instructions
├── supabase-schema.md  # Database schema
├── api-reference.md    # Service methods reference
└── folder-structure.md # This file
```

**Purpose:**
- Store project documentation
- Database schemas
- API references
- Setup guides
- Architecture decisions

**When to add documentation:**
- Database table structures
- Complex features
- API integrations
- Setup procedures

## __tests__/ Directory

Test files for the application.

```
__tests__/
├── components/         # Component tests
├── services/           # Service tests
├── hooks/              # Hook tests
└── utils/              # Utility tests
```

**Purpose:**
- Unit tests
- Integration tests
- Component tests

**Note:** Currently empty - add when implementing tests

## Best Practices

### Importing

Always import from index files:

```javascript
// Good
import { Button, Input } from '../components';
import { authService } from '../services';

// Avoid
import { Button } from '../components/Button';
import { authService } from '../services/authService';
```

### File Naming

- Components: PascalCase (e.g., `Button.js`)
- Services: camelCase (e.g., `authService.js`)
- Utils: camelCase (e.g., `validation.js`)
- Hooks: camelCase starting with 'use' (e.g., `useAuth.js`)

### Adding New Features

1. Create service in `src/services/` for API calls
2. Create components in `src/components/` for UI elements
3. Create screen in `src/screens/` for the full view
4. Add utilities in `src/utils/` if needed
5. Document in `docs/` if complex

### Code Organization

- Keep files focused and small
- One component/service per file
- Export from index.js files
- Group related functionality
- Use descriptive names

## Future Expansions

As the app grows, consider adding:

- `src/context/` - React Context providers
- `src/store/` - Redux or state management
- `src/api/` - REST API clients (separate from Supabase)
- `src/config/` - App configuration
- `src/lib/` - Third-party library wrappers
- `src/theme/` - Extended theme configuration
