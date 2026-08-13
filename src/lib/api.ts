const getApiUrl = (): string => {
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
