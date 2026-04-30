import axios from "axios";
import { API_BASE_URL } from "./config";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const EXPIRY_KEY = "expiry";
const DEFAULT_SESSION_DURATION_MS = 15 * 24 * 60 * 60 * 1000;

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

const parseJson = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const getJwtExpiry = (token) => {
  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(normalizedPayload));

    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const getStoredSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = parseJson(localStorage.getItem(USER_KEY));
  const expiresAt = Number(localStorage.getItem(EXPIRY_KEY));

  if (!token || !user || !Number.isFinite(expiresAt)) {
    return null;
  }

  return { token, user, expiresAt };
};

export const isStoredSessionValid = (session = getStoredSession()) => {
  return Boolean(session?.token && session?.user && session.expiresAt > Date.now());
};

export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRY_KEY);
};

export const saveStoredSession = ({ token, user, expiresAt }) => {
  const session = {
    token,
    user,
    expiresAt:
      expiresAt ||
      getJwtExpiry(token) ||
      Date.now() + DEFAULT_SESSION_DURATION_MS,
  };

  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  localStorage.setItem(EXPIRY_KEY, String(session.expiresAt));

  return session;
};

const notifySessionExpired = () => {
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const session = getStoredSession();

    if (session?.token) {
      if (!isStoredSessionValid(session)) {
        clearStoredSession();
        notifySessionExpired();
        delete config.headers.Authorization;
        return config;
      }

      config.headers.Authorization = `Bearer ${session.token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      clearStoredSession();
      notifySessionExpired();
    }

    return Promise.reject(error);
  },
);

export default api;
