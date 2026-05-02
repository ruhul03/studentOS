export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Handle unauthorized - maybe logout or redirect
    console.warn('Unauthorized request - check token');
  }

  return response;
};
