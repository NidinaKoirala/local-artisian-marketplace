const backendUrl = import.meta.env.VITE_BACKEND_URL;

/**
 * Fetch data from the backend
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} - The response data
 */
export const fetchData = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token'); // Fetch token from localStorage
    const response = await fetch(`${backendUrl}${endpoint}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      ...options,
    });

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
    const token = localStorage.getItem('token'); // Fetch token from localStorage
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
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
    const token = localStorage.getItem('token'); // Fetch token from localStorage
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting data from ${endpoint}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Delete error: ${error.message}`);
    throw error;
  }
};
