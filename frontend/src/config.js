// Load API base URL from Vite environment variable (frontend/.env.local)
// Falls back to localhost for local development
const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default API;
