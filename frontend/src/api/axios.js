import axios from "axios";
import { getAccess, getRefresh, setAccess, setTokens, clearTokens } from "./tokens";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token if present, excluding auth calls
api.interceptors.request.use(
  (config) => {
    const token = getAccess();
    const isAuthCall =
      config.url?.includes("/token/") || config.url?.includes("/users/signup");

    if (token && !isAuthCall) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically refresh token on 401
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes("/token/");

    if (status === 401 && original && !original._retry && !isAuthCall && getRefresh()) {
      original._retry = true;
      try {
        refreshPromise =
          refreshPromise ||
          axios
            .post(`${BASE_URL}/token/refresh/`, { refresh: getRefresh() })
            .finally(() => {
              refreshPromise = null;
            });

        const { data } = await refreshPromise;
        setAccess(data.access);
        if (data.refresh) {
          setTokens({ access: data.access, refresh: data.refresh });
        }

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (refreshError) {
        clearTokens();
        window.location.assign("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
