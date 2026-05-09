export const getAuthHeaders = () => {
  try {
    // Token is stored inside the 'studentos_user' object in localStorage
    const saved = localStorage.getItem('studentos_user');
    if (!saved) return {};
    const user = JSON.parse(saved);
    const token = user?.token;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  } catch (e) {
    return {};
  }
};

export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  // Only add JSON content type if not uploading files and no content-type is specified
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });
  
  console.log(`API [${options.method || 'GET'}] ${url} -> ${response.status}`);
  
  if (response.status === 401) {
    console.warn('Unauthorized request - check token');
  }

  return response;
};
