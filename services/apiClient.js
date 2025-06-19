import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://aiquizzbackend-3.onrender.com/app2'; // Base URL

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login function
export const loginUser = async ({ email, password }) => {
  try {
    const response = await apiClient.post('/user/signin/', { email, password });
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
      return {
        success: false,
        message: data.message || 'Login failed',
      };
    }
  } catch (error) {
    console.error('Login Error:', error?.response || error?.message);
    return {
      success: false,
      message: error?.response?.data?.message || error.message || 'An error occurred during login',
    };
  }
};

// Signup
export const signup = async (formData) => {
  try {
    const response = await axios.post("https://digi-ai.onrender.com/user/register", formData);
    console.log("🚀 ~ signup ~ response:", response.data);
    return response.data;
  } catch (error) {
    console.log("🚀 ~ signup ~ error:", error);
    throw error.response?.data || error.message;
  }
};

// OTP Verification
export const verifyOtp = async ({ email, otp }) => {
  console.log("🔐 Sending OTP verification request...", email, otp);
  try {
    const response = await axios.post("https://digi-ai.onrender.com/user/verify", { email, otp });
    console.log("✅ OTP Verification Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
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

// Generate Quiz
export const generateQuiz = async (userId, formData, isFormData = false) => {
  if (!userId) {
    throw new Error("User not logged in");
  }

  try {
    const response = await apiClient.post(
      `/quiz/${String(userId)}/`, 
      formData,
      {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      }
    );

    console.log("🚀 ~ generateQuiz response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ generateQuiz Error:", error);
    throw error.response?.data || error.message || "Quiz generation failed";
  }
};
// User Dashboard API using AsyncStorage
export const UserDashboardApi = async () => {
  try {
    const userString = await AsyncStorage.getItem('user');
    const user = JSON.parse(userString);

    if (!user || !user.userId || !user.token) {
      throw new Error("Missing userId or token in AsyncStorage");
    }

    const payload = {
      user_id: user.userId,
      token: user.token,
    };

    console.log("📦 Sending dashboard payload:", payload);

    const response = await apiClient.post("/userdashboard/", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ UserDashboard API error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export default apiClient;
