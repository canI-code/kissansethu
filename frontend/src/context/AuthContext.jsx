import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

const API_BASE = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:5000/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const loadFromStorage = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  if (value === null || value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }) {
  // Full user object from the backend (includes roles, activeRole, profiles)
  const [user, setUser] = useState(() => loadFromStorage('ks-user'));

  // JWT token for authenticated requests
  const [token, setToken] = useState(() => loadFromStorage('ks-token'));

  // Temporary OTP session data
  const [otpData, setOtpData] = useState(() => loadFromStorage('ks-otp-data'));

  // ---------------------------------------------------------------------------
  // Internal setters — always keep state + storage in sync
  // ---------------------------------------------------------------------------

  const persistUser = useCallback((data) => {
    setUser(data);
    saveToStorage('ks-user', data);
  }, []);

  const persistToken = useCallback((t) => {
    setToken(t);
    saveToStorage('ks-token', t);
  }, []);

  const persistOtpData = useCallback((data) => {
    setOtpData(data);
    saveToStorage('ks-otp-data', data);
  }, []);

  // ---------------------------------------------------------------------------
  // Auth helpers
  // ---------------------------------------------------------------------------

  /** Returns headers with Authorization if a token is available */
  const authHeaders = useCallback(
    () => ({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setOtpData(null);
    saveToStorage('ks-user', null);
    saveToStorage('ks-token', null);
    saveToStorage('ks-otp-data', null);
  }, []);

  /** POST /api/auth/send-otp */
  const sendOtp = useCallback(async (phoneNumber) => {
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const result = await res.json();
      if (result.success) {
        persistOtpData({ phoneNumber, sentAt: Date.now() });
      }
      return result;
    } catch {
      return { success: false, message: 'Failed to send OTP' };
    }
  }, [persistOtpData]);

  /** POST /api/auth/verify-otp */
  const verifyOtp = useCallback(async (otp) => {
    if (!otpData?.phoneNumber) {
      return { success: false, message: 'No OTP request found' };
    }
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: otpData.phoneNumber, otp }),
      });
      const result = await res.json();
      if (result.success && result.user) {
        persistUser(result.user);
        if (result.token) persistToken(result.token);
        persistOtpData(null);
      }
      return result;
    } catch {
      return { success: false, message: 'Failed to verify OTP' };
    }
  }, [otpData, persistUser, persistToken, persistOtpData]);

  /** POST /api/auth/check-phone */
  const checkPhoneExists = useCallback(async (phoneNumber) => {
    try {
      const res = await fetch(`${API_BASE}/auth/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      return await res.json();
    } catch {
      return { exists: false, isVerified: false };
    }
  }, []);

  /**
   * POST /api/auth/set-role
   * Sets initial role(s) for a new user. Updates local state.
   */
  const setRole = useCallback(async (userId, roles) => {
    try {
      const res = await fetch(`${API_BASE}/auth/set-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roles }),
      });
      const result = await res.json();
      if (result.success && result.user) {
        persistUser(result.user);
      }
      return result;
    } catch {
      return { success: false, message: 'Failed to set role' };
    }
  }, [persistUser]);

  /**
   * POST /api/auth/switch-role
   * Switches the active role. Updates local state and localStorage.
   */
  const switchRole = useCallback(async (role) => {
    if (!user?._id) return { success: false, message: 'Not logged in' };
    try {
      const res = await fetch(`${API_BASE}/auth/switch-role`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId: user._id, role }),
      });
      const result = await res.json();
      if (result.success && result.user) {
        persistUser(result.user);
      }
      return result;
    } catch {
      return { success: false, message: 'Failed to switch role' };
    }
  }, [user, authHeaders, persistUser]);

  /**
   * POST /api/auth/add-role
   * Adds a new role to the user's roles array.
   */
  const addRole = useCallback(async (role) => {
    if (!user?._id) return { success: false, message: 'Not logged in' };
    try {
      const res = await fetch(`${API_BASE}/auth/add-role`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId: user._id, role }),
      });
      const result = await res.json();
      if (result.success && result.user) {
        persistUser(result.user);
      }
      return result;
    } catch {
      return { success: false, message: 'Failed to add role' };
    }
  }, [user, authHeaders, persistUser]);

  /**
   * GET /api/auth/me
   * Refreshes the user profile from the server.
   */
  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: authHeaders(),
      });
      const result = await res.json();
      if (result.success && result.user) {
        persistUser(result.user);
        return result.user;
      }
      return null;
    } catch {
      return null;
    }
  }, [token, authHeaders, persistUser]);

  /**
   * Update a role-specific profile sub-document.
   * Calls PUT /api/profile/:role/:userId
   */
  const updateProfile = useCallback(async (userId, role, profileData) => {
    try {
      const res = await fetch(`${API_BASE}/profile/${role}/${userId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(profileData),
      });
      const result = await res.json();
      if (result.success) {
        // Refresh user to get updated profile
        await refreshUser();
      }
      return result;
    } catch {
      return { success: false, message: 'Failed to update profile' };
    }
  }, [authHeaders, refreshUser]);

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const activeRole = user?.activeRole || null;
  const allRoles = user?.roles || [];
  const isLoggedIn = !!user && !!user.isVerified;
  const isPhoneVerified = !!user?.isVerified;

  // Convenience accessors for role-specific profiles
  // Used by Home.jsx (greeting) and Schemes.jsx (eligibility check)
  const farmer = user?.farmerProfile || null;

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------

  const value = {
    // State
    user,
    token,
    otpData,
    activeRole,
    allRoles,
    isLoggedIn,
    isPhoneVerified,
    farmer,

    // Auth actions
    clearAuth,
    sendOtp,
    verifyOtp,
    checkPhoneExists,

    // Role actions
    setRole,
    switchRole,
    addRole,

    // Profile
    refreshUser,
    updateProfile,

    // Legacy compat (some pages use saveUser directly)
    saveUser: persistUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
