import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ks-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [otpData, setOtpData] = useState(() => {
    const saved = localStorage.getItem('ks-otp-data');
    return saved ? JSON.parse(saved) : null;
  });

  const saveUser = useCallback((data) => {
    setUser(data);
    localStorage.setItem('ks-user', JSON.stringify(data));
  }, []);

  const saveOtpData = useCallback((data) => {
    setOtpData(data);
    localStorage.setItem('ks-otp-data', JSON.stringify(data));
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setOtpData(null);
    localStorage.removeItem('ks-user');
    localStorage.removeItem('ks-otp-data');
  }, []);

  // OTP verification functions
  const sendOtp = async (phoneNumber) => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      
      const result = await response.json();
      if (result.success) {
        saveOtpData({ phoneNumber, sentAt: Date.now() });
      }
      return result;
    } catch (error) {
      console.error('Send OTP error:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (otp) => {
    if (!otpData?.phoneNumber) {
      return { success: false, message: 'No OTP request found' };
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: otpData.phoneNumber, otp })
      });
      
      const result = await response.json();
      if (result.success && result.user) {
        saveUser(result.user);
        saveOtpData(null);
      }
      return result;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  };

  const checkPhoneExists = async (phoneNumber) => {
    try {
      const response = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Check phone error:', error);
      return { exists: false, isVerified: false };
    }
  };

  const value = {
    user,
    otpData,
    saveUser,
    saveOtpData,
    clearAuth,
    sendOtp,
    verifyOtp,
    checkPhoneExists,
    isLoggedIn: !!user,
    isPhoneVerified: !!user?.isVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
