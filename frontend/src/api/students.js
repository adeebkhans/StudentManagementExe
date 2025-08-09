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
      // window.location.href = "/login";
      navigate('/login', { replace: true });

    }
    return Promise.reject(error);
  }
);

// Add a new student
export const addStudent = async (studentData) => {
  const res = await axios.post(
    `${BASE_URL}/students`,
    studentData,
    { headers: { ...getAuthHeader() }, }
  );
  return res.data;
};

// Get all students with optional query params
export const getAllStudents = async (query = {}) => {
  const params = new URLSearchParams(query).toString();
  const res = await axios.get(
    `${BASE_URL}/students${params ? `?${params}` : ""}`,
    { headers: { ...getAuthHeader() }, withCredentials: true }
  );
  return res.data;
};

// Get student by ID
export const getStudentById = async (studentId) => {
  if (!studentId || typeof studentId !== "string") throw new Error("Invalid studentId");
  const res = await fetch(
    `${BASE_URL}/students/${encodeURIComponent(studentId)}`,
    { headers: { ...getAuthHeader() } }
  );
  if (!res.ok) throw new Error("Failed to fetch student");
  return res.json();
};

// Update student by ID
export const updateStudent = async (id, studentData) => {
  const res = await axios.put(
    `${BASE_URL}/students/${id}`,
    studentData,
    { headers: { ...getAuthHeader() }, withCredentials: true }
  );
  return res.data;
};

// Delete student by ID
export const deleteStudent = async (id) => {
  const res = await axios.delete(
    `${BASE_URL}/students/${id}`,
    { headers: { ...getAuthHeader() }, withCredentials: true }
  );
  return res.data;
};

// Upload Aadhaar image
export const uploadAadhaar = async (id, file) => {
  const formData = new FormData();
  formData.append("aadhar", file);
  const res = await axios.post(
    `${BASE_URL}/students/${id}/aadhar`,
    formData,
    {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }
  );
  return res.data;
};

// Export students to Excel
export const exportStudents = async (query = {}) => {
  const params = new URLSearchParams(query).toString();
  // Return the full response, not just res.data, so headers are available
  return await axios.get(
    `${BASE_URL}/students/export${params ? `?${params}` : ""}`,
    {
      headers: { ...getAuthHeader() },
      responseType: "blob",
      withCredentials: true
    }
  );
  // return res.data; // This will be a Blob (Excel file)
};