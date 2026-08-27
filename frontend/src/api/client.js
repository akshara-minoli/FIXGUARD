const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:4001";
const REPORT_API_URL = import.meta.env.VITE_REPORT_API_URL ?? "http://localhost:4002";
const LOCATION_API_URL = import.meta.env.VITE_LOCATION_API_URL ?? "http://localhost:4003";
const ASSIGNMENT_API_URL = import.meta.env.VITE_ASSIGNMENT_API_URL ?? "http://localhost:4004";
const NOTIFICATION_API_URL = import.meta.env.VITE_NOTIFICATION_API_URL ?? "http://localhost:4005";
const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL ?? "http://localhost:4006";

export async function apiRequest(baseUrl, path, options = {}) {
  const token = localStorage.getItem("fixguard_token");
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || "The request could not be completed");
    error.status = response.status;
    error.details = body.errors;
    throw error;
  }
  return body;
}

export const authApi = (path, options) => apiRequest(AUTH_API_URL, path, options);
export const reportApi = (path, options) => apiRequest(REPORT_API_URL, path, options);
export const locationApi = (path, options) => apiRequest(LOCATION_API_URL, path, options);
export const assignmentApi = (path, options) => apiRequest(ASSIGNMENT_API_URL, path, options);
export const notificationApi = (path, options) => apiRequest(NOTIFICATION_API_URL, path, options);
export const analyticsApi = (path, options) => apiRequest(ANALYTICS_API_URL, path, options);
