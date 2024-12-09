const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

/**
 * Fetch data from the backend
 * @param {string} endpoint - The API endpoint
 * @returns {Promise<any>} - The response data
 */
export const fetchData = async (endpoint) => {
  try {
    const response = await fetch(`${backendUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Error fetching data from ${endpoint}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    throw error;
  }
};

/**
 * Send data to the backend
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The payload to send
 * @param {string} method - The HTTP method (default: 'POST')
 * @returns {Promise<any>} - The response data
 */
export const sendData = async (endpoint, data, method = 'POST') => {
  try {
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error ${method} data to ${endpoint}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${method} error: ${error.message}`);
    throw error;
  }
};

/**
 * Delete data from the backend
 * @param {string} endpoint - The API endpoint
 * @returns {Promise<any>} - The response data
 */
export const deleteData = async (endpoint) => {
  try {
    const response = await fetch(`${backendUrl}${endpoint}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Error deleting data from ${endpoint}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Delete error: ${error.message}`);
    throw error;
  }
};
