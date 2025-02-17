import axios from "axios";
import { useAuthStore } from "../store/useAuthStore.js";
import toast from "react-hot-toast";
import { navigate } from "./navigation";

// Create axios instance
export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // No need to manually set Authorization header
    // since cookies are automatically sent
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Early exit conditions:
    // 1. No response
    // 2. Not a 401 error
    // 3. Request has already been retried
    // 4. The failed request was itself a refresh token request
    // 5. The failed request was a login request with invalid credentials (401)

    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === "/auth/refresh-token" ||
      originalRequest.url === "/auth/login"
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Always attempt to refresh token first
      await axiosInstance.get("/auth/refresh-token");

      processQueue(null);

      // Retry the original request
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      // Only logout if refresh token fails
      // const logout = useAuthStore.getState().logout;
      //  try {
      //    await logout(true);
      //  } catch (error) {
      //    console.log("Error in logout in axios:", error);

      //  }
      // window.location.href = "/login";
      const store = useAuthStore.getState();

      store.setAuthUser(null);
      store.setOnlineUsers([]);

      console.log("Session expired. Please log in again.");
      navigate("/login", { replace: true });
      toast.error("Session expired. Please log in again.");

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config || {};

//     // Handle 401 errors with token refresh logic
//     // if (error.response && error.response.status === 401) {
//     if (error.response && error.response.status === 401) {
//       // Skip special cases: already retried, refresh token request, or login request

//       if (!originalRequest.skipErrorToast && (error.response.status !== 401 || originalRequest.url !== "/auth/login")) {
//         const errorMessage =
//           error.response?.data?.message ||
//           "An error occurred. Please try again.";
//         toast.error(errorMessage);
//       }

//       if (
//         originalRequest._retry ||
//         originalRequest.url === "/auth/refresh-token" ||
//         originalRequest.url === "/auth/login"
//       ) {
//         return Promise.reject(error);
//       }

//       // Handle queuing if a refresh is already in progress
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(() => axiosInstance(originalRequest))
//           .catch((err) => Promise.reject(err));
//       }

//       // Start refresh process
//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         // Attempt to refresh token
//         await axiosInstance.get("/auth/refresh-token");

//         // Process queued requests on success
//         processQueue(null);

//         // Retry the original request
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         // Process queued requests with the error
//         processQueue(refreshError);

//         try {
//           // Get store and reset auth state
//           const store = useAuthStore.getState();

//           // Use logout function if available
//           // if (typeof store.logout === "function") {
//           //   await store
//           //     .logout()
//           //     .catch((err) => console.error("Error during logout:", err));
//           // } else {
//             // Fallback to manual state reset
//             store.setAuthUser(null);
//             store.setOnlineUsers([]);
//           // }

//           // Try to use navigate if available
//           // if (typeof navigate === "function") {
//             navigate("/login", { replace: true });
//           // } else {
//             // Fallback to location.href
//             // window.location.href = "/login";
//           // }

//           toast.error("Session expired. Please log in again.");
//         } catch (logoutError) {
//           console.error("Error handling session expiration:", logoutError);
//           // Last resort fallback
//           window.location.href = "/login";
//         }

//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     } else {
//       // Handle all non-401 errors with toast
//       // Skip toast if skipErrorToast flag is set
//       if (!originalRequest.skipErrorToast && (error.response.status !== 401 || originalRequest.url !== "/auth/login")) {
//         const errorMessage =
//           error.response?.data?.message ||
//           "An error occurred. Please try again.";
//         toast.error(errorMessage);
//       }

//       return Promise.reject(error);
//     }
//   }
// );

export default axiosInstance;
