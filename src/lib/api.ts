const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return process.env.NEXT_PUBLIC_DEV_API_URL || "http://localhost:5000";
    }
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000";
  }
  return "https://my-next-js-restaurant-lnc6.vercel.app";
};

const rawUrl = getApiUrl();
const API_BASE_URL = rawUrl.trim().replace(/['"]/g, "").replace(/\/+$/, "");

export default API_BASE_URL;
