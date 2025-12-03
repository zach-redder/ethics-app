# Setup Guide

Complete guide to setting up your development environment for the Ethics App.

## Prerequisites

Before you begin, make sure you have:

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account (https://supabase.com)
- Expo Go app on your mobile device (for testing)

## Step 1: Clone and Install

```bash
# Navigate to project directory
cd ethics-app

# Install dependencies
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to https://supabase.com
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - Name: ethics-app (or your preferred name)
   - Database Password: (secure password)
   - Region: (closest to your users)
5. Wait for project to be created

### Get Your API Keys

1. In your Supabase dashboard, go to Settings > API
2. Copy the following:
   - Project URL
   - anon/public key

### Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Create Database Tables

1. In Supabase dashboard, go to SQL Editor
2. Copy and paste the SQL from `docs/supabase-schema.md`
3. Run each section to create:
   - Tables (profiles, items, etc.)
   - Functions (handle_new_user, update_updated_at_column)
   - Triggers
   - Row Level Security policies

### Enable Authentication

1. Go to Authentication > Settings
2. Configure email settings:
   - Enable Email provider
   - Configure email templates (optional)
3. Add your site URL in "Site URL" field
4. Add redirect URLs if needed

### Enable Real-time (Optional)

1. Go to Database > Replication
2. Enable replication for tables that need real-time updates:
   - profiles
   - items

## Step 3: Start Development

```bash
# Start Expo development server
npm start

# Or use specific platform
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

## Step 4: Test the App

1. Scan the QR code with Expo Go app (iOS/Android)
2. The app should load on your device
3. Test basic functionality:
   - Sign up with a new account
   - Check if profile is created in Supabase
   - Navigate between screens
   - Test data fetching

## Common Issues

### Environment Variables Not Loading

- Make sure `.env` file is in the root directory
- Restart the Expo development server
- Clear cache: `expo start -c`

### Supabase Connection Error

- Verify your API URL and keys are correct
- Check if your Supabase project is active
- Ensure you're using `EXPO_PUBLIC_` prefix for environment variables

### Dependencies Installation Failed

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### iOS/Android Build Issues

```bash
# Clear Expo cache
expo start -c

# Rebuild dependencies
npx expo install --check

# For iOS, clear pods
cd ios && pod install && cd ..
```

## Project Structure

```
ethics-app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── services/        # Supabase and API services
│   ├── navigation/      # Navigation configuration
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── constants/       # App constants (theme, etc.)
│   └── types/           # TypeScript types (if using TS)
├── assets/              # Images, fonts, etc.
├── docs/                # Documentation
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── app.json             # Expo configuration
└── App.js               # Main app entry point
```

## Next Steps

1. Review the code structure in `src/`
2. Check `docs/supabase-schema.md` for database schema
3. Explore `docs/api-reference.md` for service methods
4. Start building your features!

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

## Getting Help

If you encounter issues:
1. Check the documentation in `docs/`
2. Review Supabase logs in dashboard
3. Check Expo error messages carefully
4. Search for similar issues online
