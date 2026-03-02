# Folder Structure

## Project Root

```
ethics-app/
├── src/                 # Source code
├── assets/              # Static assets
├── screen-mockups/      # UI design mockups
├── docs/                # Project documentation
├── .env.example         # Environment template
├── .gitignore
├── app.json             # Expo configuration
├── babel.config.js
├── eas.json             # EAS Build configuration
├── App.js               # Main app entry point
├── index.js             # App registration
├── package.json
└── package-lock.json
```

## src/ Directory

### src/components/

Reusable UI components used across multiple screens.

```
src/components/
├── BottomTabBar.js
├── Button.js
├── Input.js
├── icons/
│   ├── HomeIcon.js
│   └── ProfileIcon.js2
└── index.js
```

### src/screens/

Full-page screen components organized by feature area.

```
src/screens/
├── dashboard/
│   └── DashboardScreen.js
├── groups/
│   ├── CreateGroupScreen.js
│   ├── GroupConfirmationScreen.js
│   ├── JoinGroupScreen.js
│   ├── created-groups/
│   │   ├── AddExerciseModal.js
│   │   ├── CreatedGroupDetailScreen.js
│   │   ├── DeleteExerciseModal.js
│   │   ├── DeleteGroupModal.js
│   │   ├── DeleteMemberModal.js
│   │   ├── EditExerciseModal.js
│   │   ├── EditGroupModal.js
│   │   ├── ExerciseDetailScreen.js
│   │   ├── ExerciseMenuModal.js
│   │   ├── GroupSettingsModal.js
│   │   └── ManageMembersScreen.js
│   └── joined-groups/
│       ├── DayNotesModal.js
│       ├── EditTimeframeModal.js
│       ├── InstructionsModal.js
│       ├── JoinedExerciseDetailScreen.js
│       ├── JoinedExerciseMenuModal.js
│       └── JoinedGroupDetailScreen.js
├── onboarding/
│   ├── GroupChoiceScreen.js
│   ├── NameInputScreen.js
│   ├── SignInScreen.js
│   ├── SignUpScreen.js
│   └── WelcomeScreen.js
└── profile/
    ├── DeleteAccountModal.js
    ├── EditProfileModal.js
    ├── NotificationSettingsScreen.js
    ├── ProfileScreen.js
    ├── ReportIssueScreen.js
    └── ReportIssueSuccessModal.js
```

**Naming conventions:** Screens use `[Name]Screen.js`, modals use `[Name]Modal.js`.

### src/services/

Business logic and Supabase API integrations.

```
src/services/
├── supabase.js                       # Supabase client configuration
├── authService.js                    # Authentication operations
├── userService.js                    # User profile operations
├── groupService.js                   # Group CRUD operations
├── groupMemberService.js             # Group membership operations
├── exerciseService.js                # Exercise CRUD operations
├── exerciseProgressService.js        # Exercise progress tracking
├── userExerciseCustomizationService.js
├── notificationService.js
├── issueReportService.js
└── index.js
```

Each service exports an object with methods:
```javascript
export const serviceName = {
  create: async () => {},
  getById: async () => {},
  update: async () => {},
  delete: async () => {},
};
```

### src/hooks/

Custom React hooks for reusable stateful logic.

```
src/hooks/
├── useAuth.js
└── index.js
```

### src/utils/

Pure utility functions and helpers.

```
src/utils/
├── validation.js
├── formatters.js
└── index.js
```

### src/constants/

Application-wide constants and configuration.

```
src/constants/
├── theme.js   # Theme colors, sizes, fonts
└── index.js
```

## assets/ Directory

```
assets/
└── logo.png
```

## screen-mockups/ Directory

UI design mockups organized by feature area.

```
screen-mockups/
├── created-groups/
├── joined-groups/
├── onboarding/
├── profile/
└── general/
```

## docs/ Directory

```
docs/
├── README.md
├── setup-guide.md
├── supabase-schema.md
├── api-reference.md
└── folder-structure.md
```

## Adding New Features

1. Create service in `src/services/` for API calls
2. Create components in `src/components/` for shared UI elements
3. Create screens in the appropriate `src/screens/[feature]/` subdirectory
4. Export from each directory's `index.js`
