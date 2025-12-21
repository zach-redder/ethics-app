import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get environment variables - try both process.env and Constants.expoConfig
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 
                    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
                    '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                        Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                        '';

// Debug logging (only log first few chars of key for security)
console.log('═══════════════════════════════════════════════════');
console.log('🔍 Supabase Configuration Check');
console.log('═══════════════════════════════════════════════════');
console.log('📋 Environment Variables:');
console.log('  - URL present:', !!supabaseUrl);
if (supabaseUrl) {
  console.log('  - URL value:', supabaseUrl);
  console.log('  - URL valid:', supabaseUrl.startsWith('http'));
} else {
  console.log('  - URL: MISSING ❌');
}
console.log('  - Key present:', !!supabaseAnonKey);
if (supabaseAnonKey) {
  console.log('  - Key preview:', `${supabaseAnonKey.substring(0, 20)}...`);
  console.log('  - Key length:', supabaseAnonKey.length);
} else {
  console.log('  - Key: MISSING ❌');
}
console.log('═══════════════════════════════════════════════════');

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!');
  console.error('Please create a .env file with:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('Then restart the Expo development server with: npm start -- --clear');
  console.error('Make sure to stop the server completely (Ctrl+C) before restarting.');
} else {
  console.log('✅ Supabase environment variables loaded successfully');
}

// Create Supabase client with AsyncStorage for session persistence
// Use placeholder values if env vars are missing to prevent crashes
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

console.log('🔧 Creating Supabase client with URL:', finalUrl);

// Track request counts to prevent infinite loops
const requestTracker = new Map();
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Track if we've had refresh token failures specifically (not general network failures)
let hasRefreshTokenFailure = false;

// Custom fetch wrapper with logging and retry prevention
const customFetch = async (url, options = {}) => {
  const urlString = typeof url === 'string' ? url : url.toString();
  const requestKey = `${options.method || 'GET'}:${urlString}`;
  const requestCount = requestTracker.get(requestKey) || 0;
  const isRefreshTokenRequest = urlString.includes('grant_type=refresh_token');
  const isAuthRequest = urlString.includes('/auth/v1/') && (
    urlString.includes('signup') || 
    urlString.includes('token') && !isRefreshTokenRequest ||
    urlString.includes('verify') ||
    urlString.includes('recover')
  );
  
  // ONLY block refresh token requests if we've had refresh token failures
  // NEVER block sign-in/sign-up requests
  if (isRefreshTokenRequest && hasRefreshTokenFailure) {
    console.warn('⚠️ [Network] Skipping refresh token request due to previous refresh failures');
    console.warn('🧹 [Network] Clearing session to prevent further refresh attempts');
    // Clear session asynchronously (don't await to avoid blocking)
    clearSession().catch(() => {});
    throw new Error('Refresh token unavailable - session cleared');
  }
  
  // Prevent infinite retries
  if (requestCount >= MAX_RETRIES) {
    console.error('🛑 [Network] Max retries reached for:', requestKey.substring(0, 100));
    if (isRefreshTokenRequest) {
      hasRefreshTokenFailure = true;
      // Clear session on max retries for refresh token
      clearSession().catch(() => {});
    }
    throw new Error(`Network request failed after ${MAX_RETRIES} attempts`);
  }
  
  requestTracker.set(requestKey, requestCount + 1);
  
  console.log('🌐 [Network] Request:', {
    attempt: requestCount + 1,
    method: options.method || 'GET',
    url: urlString.substring(0, 100),
    timestamp: new Date().toISOString(),
  });
  
  try {
    // Use the global fetch (polyfilled by react-native-url-polyfill)
    const response = await fetch(url, options);
    
    console.log('✅ [Network] Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: urlString.substring(0, 100),
    });
    
    // Reset counter on success
    requestTracker.delete(requestKey);
    
    // Reset refresh token failure flag on ANY successful auth request
    if (response.ok && isAuthRequest) {
      hasRefreshTokenFailure = false; // Reset on successful auth request
      console.log('✅ [Network] Auth request succeeded - resetting refresh token failure flag');
    }
    
    return response;
  } catch (error) {
    console.error('❌ [Network] Request Failed:', {
      attempt: requestCount + 1,
      error: error.message,
      errorType: error.constructor.name,
      errorName: error.name,
      url: urlString.substring(0, 100),
      willRetry: requestCount + 1 < MAX_RETRIES,
    });
    
    // Mark refresh token failure ONLY for refresh token requests
    if (isRefreshTokenRequest) {
      hasRefreshTokenFailure = true;
      console.warn('⚠️ [Network] Refresh token request failed - will skip future refresh attempts');
    }
    
    // Log stack trace for debugging (but only for first attempt to reduce noise)
    if (requestCount === 0 && error.stack) {
      console.error('📚 [Network] Stack trace:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
    
    // If we haven't exceeded max retries, the error will propagate and Supabase will retry
    // Otherwise, throw immediately
    if (requestCount + 1 >= MAX_RETRIES) {
      requestTracker.delete(requestKey);
      // Clear session on final failure for refresh token
      if (urlString.includes('refresh_token')) {
        console.warn('🛑 [Network] Final refresh token failure - clearing session');
        clearSession().catch(() => {});
      }
      throw error;
    }
    
    throw error;
  }
};

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false, // Disable auto-refresh to prevent infinite loops on network errors
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: customFetch,
  },
});

console.log('✅ Supabase client created successfully');

// On startup, check if there's a stored session and validate it
// This prevents refresh token loops from corrupted sessions
(async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const hasStoredSession = allKeys.some(key => 
      key.includes('supabase') || 
      key.includes('sb-') ||
      key.includes('auth-token')
    );
    
    if (hasStoredSession) {
      console.log('ℹ️ [Supabase] Found stored session, will validate on first auth check');
      // Don't clear immediately - let the auth check handle it
      // This prevents clearing valid sessions
    }
  } catch (error) {
    console.warn('⚠️ [Supabase] Error checking for stored session:', error.message);
  }
})();

// Track if we're currently clearing to prevent recursive calls
let isClearingSession = false;

// Helper function to clear corrupted session data
export const clearSession = async () => {
  // Prevent recursive calls
  if (isClearingSession) {
    console.log('⚠️ [clearSession] Already clearing session, skipping duplicate call');
    return false;
  }
  
  isClearingSession = true;
  
  try {
    console.log('🧹 [clearSession] Starting session cleanup...');
    
    // Clear AsyncStorage FIRST (this prevents auth state changes from triggering more clears)
    const allKeys = await AsyncStorage.getAllKeys();
    const supabaseKeys = allKeys.filter(key => 
      key.includes('supabase') || 
      key.includes('sb-') ||
      key.includes('auth-token') ||
      key.includes('auth.token')
    );
    
    if (supabaseKeys.length > 0) {
      console.log(`🧹 [clearSession] Found ${supabaseKeys.length} session keys to clear`);
      await AsyncStorage.multiRemove(supabaseKeys);
      console.log('✅ [clearSession] Cleared', supabaseKeys.length, 'session keys');
    } else {
      console.log('ℹ️ [clearSession] No session keys found to clear');
    }
    
    // Also try specific known key patterns
    const projectId = finalUrl.split('//')[1]?.split('.')[0];
    if (projectId) {
      const specificKeys = [
        `sb-${projectId}-auth-token`,
        `supabase.auth.token`,
        `sb-${projectId}-auth-token-code-verifier`,
      ];
      try {
        await AsyncStorage.multiRemove(specificKeys);
      } catch (e) {
        // Ignore - keys might not exist
      }
    }
    
    // Then try to sign out (but don't wait for it - it might fail if network is down)
    // This is done AFTER clearing storage to prevent auth state change loops
    supabase.auth.signOut().catch(() => {
      // Ignore errors - we've already cleared storage
    });
    
    console.log('✅ [clearSession] Session cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ [clearSession] Error clearing session:', error);
    return false;
  } finally {
    // Reset flag after a short delay to allow any pending operations to complete
    setTimeout(() => {
      isClearingSession = false;
    }, 1000);
  }
};

// Note: Auto-refresh is disabled to prevent infinite loops
// Sessions will need to be manually refreshed or user will need to sign in again

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
           supabaseUrl !== 'https://placeholder.supabase.co' &&
           supabaseAnonKey !== 'placeholder-key');
};

// Export auth helpers
export const auth = supabase.auth;

// Export database helper
export const db = supabase;
