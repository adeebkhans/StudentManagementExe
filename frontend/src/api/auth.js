import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3009/api/v1";

// Login manager
export const login = async (email, password) => {
  const res = await axios.post(
    `${BASE_URL}/auth/login`,
    { email, password },
  );
  return res.data;
};

// Optionally, add logout logic (just remove token from storage)
export const logout = () => {
  localStorage.removeItem("token");
};

// Optionally, check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};