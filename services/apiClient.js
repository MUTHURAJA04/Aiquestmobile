// apiClient.js
import axios from 'axios';

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
    const response = await apiClient.post('/user/signin/', {
      email,
      password,
    });

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
      message:
        error?.response?.data?.message || error.message || 'An error occurred during login',
    };
  }
};

// POST: Signup
export const signup = async (formData) => {
  try {
    const response = await axios.post(
      "https://digi-ai.onrender.com/user/register",
      formData
    );
    console.log("🚀 ~ signup ~ response:", response.data);
    return response.data;
  } catch (error) {
    console.log("🚀 ~ signup ~ error:", error);
    throw error.response?.data || error.message;
  }
};

// POST: OTP Verification
export const verifyOtp = async ({ email, otp }) => {
  console.log("🔐 Sending OTP verification request...", email, otp);

  try {
    const response = await axios.post("https://digi-ai.onrender.com/user/verify", {
      email,
      otp,
    });

    console.log("✅ OTP Verification Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    throw error.response?.data || error.message || "OTP verification failed";
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(
      "https://digi-ai.onrender.com/user/forgot-password",
      { email }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};


export default apiClient;
