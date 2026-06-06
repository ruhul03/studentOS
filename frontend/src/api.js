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

  const maxRetries = (!options.method || options.method === 'GET') ? 1 : 0;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, { ...options, headers });
      
      // Only log in development to prevent information leakage in production
      if (import.meta.env.DEV) {
        console.log(`API [${options.method || 'GET'}] ${url} -> ${response.status}`);
      }
      
      if (response.status === 401) {
        console.warn('Unauthorized request - check token');
        localStorage.removeItem('studentos_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }

      return response;
    } catch (error) {
      console.error(`Network Error on [${options.method || 'GET'}] ${url} (Attempt ${attempt + 1}):`, error);
      if (attempt < maxRetries) {
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s before retry
        continue;
      }
      // Return a synthesized response object so the app doesn't crash on network failures
      return {
        ok: false,
        status: 503,
        json: async () => ({ message: 'Network error. Please check your connection.' })
      };
    }
  }
};
