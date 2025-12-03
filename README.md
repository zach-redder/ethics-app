# Ethics App

A React Native mobile application built with Expo and Supabase.

## Quick Start

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up your Supabase database using the SQL in `docs/supabase-schema.md`

5. Start the development server:
   ```bash
   npm start
   ```

6. Scan the QR code with Expo Go app

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Setup Guide](docs/setup-guide.md)** - Complete setup instructions
- **[Supabase Schema](docs/supabase-schema.md)** - Database tables and structure
- **[API Reference](docs/api-reference.md)** - Service methods and APIs
- **[Folder Structure](docs/folder-structure.md)** - Project organization

## Project Structure

```
ethics-app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── services/        # Supabase services and API calls
│   ├── navigation/      # Navigation configuration (add React Navigation)
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── constants/       # App constants and theme
│   └── types/           # TypeScript types (if using TypeScript)
├── assets/              # Images, fonts, icons
├── docs/                # Documentation
└── __tests__/           # Test files
```

## Features

This starter template includes:

- ✅ Expo React Native setup
- ✅ Supabase integration (authentication & database)
- ✅ Example screens (Login, Home, Profile)
- ✅ Reusable components (Button, Input)
- ✅ Service layer for API calls
- ✅ Custom hooks (useAuth)
- ✅ Utility functions (validation, formatters)
- ✅ Theme constants
- ✅ Comprehensive documentation

## Tech Stack

- **[Expo](https://expo.dev/)** - React Native framework
- **[React Native](https://reactnative.dev/)** - Mobile framework
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Real-time subscriptions
  - Row Level Security

## Next Steps

1. **Set up Supabase:**
   - Follow `docs/setup-guide.md`
   - Create tables using `docs/supabase-schema.md`

2. **Implement navigation:**
   - Install React Navigation
   - Replace basic navigation in `App.js`

3. **Customize:**
   - Update theme in `src/constants/theme.js`
   - Modify screens for your use case
   - Add your own services and components

4. **Add features:**
   - Create new screens
   - Add new Supabase tables
   - Implement your business logic

## Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
npm test           # Run tests (when added)
```

## Environment Variables

Required environment variables (add to `.env`):

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Important Notes

- The current app uses basic navigation for demonstration
- For production, implement [React Navigation](https://reactnavigation.org/)
- Make sure to set up your Supabase database tables
- Enable Row Level Security (RLS) on all tables
- Test authentication flow before deploying

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

## Troubleshooting

If you encounter issues:

1. Clear Expo cache: `expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check environment variables are set correctly
4. Verify Supabase project is active
5. Review logs in Expo console

For more help, see `docs/setup-guide.md`

## License

This project is open source and available for use in your projects.
