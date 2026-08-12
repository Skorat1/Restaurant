const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000";
    }
    return "https://my-next-js-restaurant-lnc6.vercel.app";
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://my-next-js-restaurant-lnc6.vercel.app";
};

const rawUrl = getApiUrl();
const API_BASE_URL = rawUrl.trim().replace(/['"]/g, "").replace(/\/+$/, "");

export default API_BASE_URL;


