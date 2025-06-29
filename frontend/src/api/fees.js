import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3009/api/v1";

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Axios response interceptor for auth errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("token");
      navigate('/login', { replace: true });
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Create a new fee record
export const createFee = async (feeData) => {
  const res = await axios.post(
    `${BASE_URL}/fees`,
    feeData,
    { headers: { ...getAuthHeader() } }
  );
  return res.data;
};

// Get all fee records with optional query params
export const getAllFees = async (query = {}) => {
  const params = new URLSearchParams(query).toString();
  const res = await axios.get(
    `${BASE_URL}/fees${params ? `?${params}` : ""}`,
    { headers: { ...getAuthHeader() } }
  );
  return res.data;
};

// Get a fee record by ID
export const getFeeById = async (id) => {
  const res = await axios.get(
    `${BASE_URL}/fees/${id}`,
    { headers: { ...getAuthHeader() } }
  );
  return res.data;
};

// Get all fee records for a specific student
export const getFeesByStudentId = async (studentId) => {
  const res = await axios.get(
    `${BASE_URL}/fees/student/${studentId}`,
    { headers: { ...getAuthHeader() } }
  );
  return res.data;
};

// Update a fee record by ID
export const updateFee = async (id, updateData) => {
  const res = await axios.put(
    `${BASE_URL}/fees/${id}`,
    updateData,
    { headers: { ...getAuthHeader() } }
  );
  return res.data;
};

// Delete a fee record by ID
export const deleteFee = async (id) => {
  const res = await axios.delete(
    `${BASE_URL}/fees/${id}`,
    { headers: { ...getAuthHeader() } }
  );
  return res.data;
};

// Get all students with no fee records, with optional query params
export const getNewStudentsWithNoFeeRecords = async (query = {}) => {
  const params = new URLSearchParams(query).toString();
  const res = await axios.get(
    `${BASE_URL}/fees/newstudents${params ? `?${params}` : ""}`,
    { headers: { ...getAuthHeader() } }
  );
  return res.data;
};

// Export fees to Excel with optional query params
export const exportFees = async (query = {}) => {
  const params = new URLSearchParams(query).toString();
  return await axios.get(
    `${BASE_URL}/fees/export${params ? `?${params}` : ""}`,
    {
      headers: { ...getAuthHeader() },
      responseType: "blob"
    }
  );
  // return res.data; // This will be a Blob (Excel file) 
  // but we are retuning whole to send headers for dynamic file name

};