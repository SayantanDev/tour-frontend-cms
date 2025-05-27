import axios from 'axios';

const axiosServices = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}`,
});


// Request Interceptor: Attach access token
axiosServices.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Refresh token on 401
axiosServices.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to access token expiry and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        // Request new access token using refresh token
        const { data } = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/refresh-token`, // Adjust this endpoint
          { refreshToken }
        );

        // Save new access token
        localStorage.setItem("accessToken", data.accessToken);

        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosServices(originalRequest);
      } catch (err) {
        // Refresh token invalid or expired
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/"; // Redirect to login
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosServices;