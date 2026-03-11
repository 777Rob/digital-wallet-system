export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "/api");
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? "http://localhost:3000" : ""); // We don't connect to WS in prod
