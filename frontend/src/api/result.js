import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3009/api/v1";

// Helper to get auth token 
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create or update result
export const createOrUpdateResult = async (resultData) => {
  const res = await axios.post(
    `${BASE_URL}/result`,
    resultData,
    { headers: { ...getAuthHeader() },  }
  );
  return res.data;
};

// Get all results
export const getAllResults = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(
        `${BASE_URL}/result${query ? `?${query}` : ""}`,
        { 
            headers: { 
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            },
            
        }
    );
    return res.data;
};

// Get results by student id (with optional query params like year)
export const getResultsByStudentId = async (studentId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await axios.get(
    `${BASE_URL}/result/student/${studentId}${query ? `?${query}` : ""}`,
    { headers: { ...getAuthHeader() },  }
  );
  return res.data;
};

// Get result by result document id
export const getResultById = async (resultId) => {
  const res = await axios.get(
    `${BASE_URL}/result/${resultId}`,
    { headers: { ...getAuthHeader() },  }
  );
  return res.data;
};

// Export results as Excel (download file)
export const exportResults = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await axios.get(
    `${BASE_URL}/result/export${query ? `?${query}` : ""}`,
    {
      headers: { ...getAuthHeader() },
      responseType: 'blob', // Important for file download
      
    }
  );
  return response; // Return the full response object, not just response.data
};

// Update or create results for multiple students/subjects in mass
export const updateResultSubjectwise = async (payload) => {
  const res = await axios.post(
    `${BASE_URL}/result/subjects`,
    payload,
    {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      
    }
  );
  return res.data;
};