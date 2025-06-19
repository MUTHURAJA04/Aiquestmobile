import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://aiquizzbackend-3.onrender.com/';

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🐞 Debug Interceptors
apiClient.interceptors.request.use((request) => {
  console.log('📡 Request:', request.url, request.data);
  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Login
export const loginUser = async ({ email, password }) => {
  try {
    const response = await apiClient.post('app2/user/signin/', { email, password });
    const data = response.data;

    if (data.status === 1) {
      return {
        success: true,
        message: data.message,
        fullName: data.full_name,
        userId: data.user_id,
        token: data.token,
        role: data.role,
      };
    } else {
      return { success: false, message: data.message || 'Login failed' };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred during login',
    };
  }
};

// Signup
export const signup = async (formData) => {
  try {
    const response = await axios.post("https://digi-ai.onrender.com/user/register", formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// OTP Verification
export const verifyOtp = async ({ email, otp }) => {
  try {
    const response = await axios.post("https://digi-ai.onrender.com/user/verify", { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || "OTP verification failed";
  }
};

// Forgot Password
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post("https://digi-ai.onrender.com/user/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// ✅ Generate Quiz
export const generateQuiz = async (userId, formData, isFormData = false) => {
  if (!userId) throw new Error("User not logged in");

  try {
    const response = await apiClient.post(
      `app/quiz/${userId}/`,
      formData,
      {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || "Quiz generation failed";
  }
};

// ✅ User Dashboard
export const UserDashboardApi = async () => {
  try {
    const userString = await AsyncStorage.getItem('user');
    const user = JSON.parse(userString);

    if (!user?.userId || !user?.token) {
      throw new Error("Missing userId or token in AsyncStorage");
    }

    const payload = {
      user_id: user.userId,
      token: user.token,
    };

    const response = await apiClient.post("app2/userdashboard/", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default apiClient;
