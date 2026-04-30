/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, {
  AUTH_SESSION_EXPIRED_EVENT,
  clearStoredSession,
  getStoredSession,
  isStoredSessionValid,
  saveStoredSession,
} from "../utils/api";
import { connectSocket, disconnectSocket } from "../utils/socket";

const AuthContext = createContext(null);

const getInitialSession = () => {
  const session = getStoredSession();
  return isStoredSessionValid(session) ? session : null;
};

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(getInitialSession);
  const [loading, setLoading] = useState(true);

  const user = session?.user || null;
  const token = session?.token || null;
  const expiresAt = session?.expiresAt || null;

  const clearSession = useCallback(() => {
    clearStoredSession();
    setSession(null);
    disconnectSocket();
  }, []);

  const persistSession = useCallback((nextSession) => {
    saveStoredSession(nextSession);
    setSession(nextSession);

    if (nextSession.user?._id) {
      connectSocket(nextSession.user._id);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedSession = getStoredSession();

      if (!isStoredSessionValid(storedSession)) {
        clearSession();
        if (isMounted) setLoading(false);
        return;
      }

      setSession(storedSession);
      setLoading(false);

      if (storedSession.user?._id) {
        connectSocket(storedSession.user._id);
      }

      try {
        const res = await api.get("/users/profile");

        if (!isMounted) return;

        persistSession({
          token: storedSession.token,
          user: res.data.user,
          expiresAt: storedSession.expiresAt,
        });
      } catch (err) {
        const status = err.response?.status;

        if (status === 401 || status === 403) {
          clearSession();
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [clearSession, persistSession]);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearSession();
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
    };
  }, [clearSession]);

  useEffect(() => {
    if (!expiresAt) return undefined;

    const msUntilExpiry = expiresAt - Date.now();

    if (msUntilExpiry <= 0) {
      clearSession();
      return undefined;
    }

    const timeoutId = window.setTimeout(clearSession, msUntilExpiry);

    return () => window.clearTimeout(timeoutId);
  }, [clearSession, expiresAt]);

  useEffect(() => {
    if (user?._id) {
      connectSocket(user._id);
    } else {
      disconnectSocket();
    }
  }, [user?._id]);

  const login = useCallback(
    async (form) => {
      try {
        const res = await api.post("/auth/login", form);
        const { user: loggedInUser, token: jwtToken } = res.data;

        if (!loggedInUser || !jwtToken) {
          throw new Error("Invalid response from server");
        }

        const nextSession = saveStoredSession({
          token: jwtToken,
          user: loggedInUser,
        });

        setSession(nextSession);
        connectSocket(loggedInUser._id);

        return loggedInUser;
      } catch (err) {
        throw err.response?.data?.error || err.message || "Login failed";
      }
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const updateAuthUser = useCallback(
    (nextUser) => {
      if (!nextUser || !token) return;

      persistSession({
        token,
        user: nextUser,
        expiresAt,
      });
    },
    [expiresAt, persistSession, token],
  );

  const register = useCallback(async (form) => {
    try {
      const res = await api.post("/auth/register", form);
      return res.data;
    } catch (err) {
      throw err.response?.data?.error || err.message || "Registration failed";
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      expiresAt,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      logout,
      register,
      updateAuthUser,
    }),
    [
      expiresAt,
      loading,
      login,
      logout,
      register,
      token,
      updateAuthUser,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthProvider;
export { useAuth };
