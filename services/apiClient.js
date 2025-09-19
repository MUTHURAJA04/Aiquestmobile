import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://dev-api.digiaiquest.com';

// const API_BASE_URL = 'http://192.168.1.101:8000';



const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug Interceptors
apiClient.interceptors.request.use((request) => {
  console.log(' Request:', request.url, request.data);
  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(' Response:', response.data);
    return response;
  },
  (error) => {
    console.error(' API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User login 
export const loginUser = async (payload) => {
  try {
    const response = await apiClient.post('app2/user/signin/', payload);
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

// Google SSO Login
export const googleSSOLogin = async ({ google_id_token, country, state }) => {
  try {
    const response = await apiClient.post("app2/user/signin/", {
      google_id_token,
      country,
      state,
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
        message: data.message || 'Google login failed' 
      };
    }
  } catch (error) {
    console.error("❌ Google Login API Error:", error.response?.data || error.message);
    
    // Handle duplicate key error
    if (error.response?.data?.error?.includes('E11000 duplicate key error')) {
      try {
        // Extract email from the Google token
        const payload = google_id_token.split('.')[1];
        // Add padding if needed for base64
        let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        const decodedPayload = JSON.parse(atob(base64));
        const googleEmail = decodedPayload.email;
        
        return {
          success: false,
          message: `Please use email login with: ${googleEmail}`,
          googleEmail: googleEmail
        };
      } catch (parseError) {
        return {
          success: false,
          message: 'Google login failed. Please try email login instead.'
        };
      }
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Google login failed. Please try again.'
    };
  }
};

// 🔹 Signup
export const signup = async (formData) => {
  try {
    const response = await axios.post(
      'https://dev-service.digiaiquest.com/user/register',
      formData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// OTP Verification
export const verifyOtp = async ({ email, otp }) => {
  try {
    const response = await axios.post("https://dev-service.digiaiquest.com/user/verify", { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || "OTP verification failed";
  }
};

// Forgot Password
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post("https://dev-service.digiaiquest.com/user/forgot-password", { email });
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
    // 🔹 Get stored user info
    const userString = await AsyncStorage.getItem("user");
    if (!userString) {
      throw new Error("No user found in storage");
    }

    const user = JSON.parse(userString);

    if (!user?.userId || !user?.token) {
      throw new Error("Missing userId or token in AsyncStorage");
    }

    // 🔹 Prepare payload
    const payload = {
      user_id: user.userId,
      token: user.token,
    };

    // 🔹 API request
    const response = await apiClient.post("app2/userdashboard/", payload);

    // 🔹 Check if response has success status
    if (response.data && response.data.status === 1) {
      return response.data;
    } else {
      // Handle case where backend returns status 0 (false)
      console.warn("⚠️ Dashboard API returned status 0:", response.data);
      throw new Error(response.data.message || "Failed to fetch dashboard data");
    }

  } catch (error) {
    // 🔹 Handle network / server errors
    if (error.response) {
      // Server responded with error
      console.error("📥 API ERROR RESPONSE:", error.response.data);
      
      // Check if backend returned status 0 with message
      if (error.response.data && error.response.data.status === 0) {
        throw new Error(error.response.data.message || "Dashboard request failed");
      }
      
      throw error.response.data;
    } else if (error.request) {
      // No response from server
      console.error("❌ No response received:", error.request);
      throw new Error("No response from server. Please try again.");
    } else {
      // Other error
      console.error("⚠️ Request setup error:", error.message);
      throw new Error(error.message || "Something went wrong");
    }
  }
};





// apiClient.js (add this near other APIs)
export const getCredits = async () => {
  try {
    const userString = await AsyncStorage.getItem("user");
    const user = JSON.parse(userString);

    if (!user?.userId || !user?.token) {
      throw new Error("Missing userId or token in AsyncStorage");
    }

    const payload = {
      user_id: user.userId,
      token: user.token,
    };

    const response = await apiClient.post("payments/remaining_credits/", payload);
    return response.data; // { remaining_credits: ... }
  } catch (error) {
    console.error("Error fetching credits:", error);
    throw error;
  }
};


// Get Plans
export const getPlans = async () => {
  try {
    const userString = await AsyncStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    if (!user?.userId || !user?.token) {
      throw new Error('User authentication required');
    }

    const response = await apiClient.post('/payments/plans/', {
      user_id: user.userId,
      token: user.token,
    });
    
    return response.data?.plans || [];
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
};

// Create Order
export const createOrder = async (userId, planId, token) => {
  try {
    const response = await apiClient.post('/payments/payment/create/', {
      user_id: userId,
      plan_id: planId,
      token: token,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Verify Payment
export const verifyPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/payments/payment/verify/', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};




export const submitQuiz = async (quiz_id, user_answers) => {
  try {
    // Get user data from AsyncStorage
    const userString = await AsyncStorage.getItem('user');
    const user = JSON.parse(userString);
    
    if (!user?.userId || !user?.token) {
      throw new Error("User not authenticated");
    }

    // Prepare payload
    const payload = {
      quiz_id,
      user_answers,
      user_id: user.userId,
      token: user.token
    };

    // Make the API request with user ID in URL
    const response = await apiClient.post(
      `app/submitquiz/${user.userId}/`, // Fixed URL with user ID parameter
      payload
    );

    return response.data;
  } catch (error) {
    console.error('Submit Quiz Error:', error);
    throw error;
  }
};


//  generateFlashcards 
export const generateFlashcards = async (topic, language = "en") => {
  try {
    const userString = await AsyncStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const flashcardCount = await AsyncStorage.getItem("flashcard_count") || "10";

    console.log(' User data from AsyncStorage:', user);

    // FIX: Use user_id instead of userId
    if (!user?.user_id || !user?.token) {
      throw new Error("Missing user_id or token in AsyncStorage. Please login again.");
    }

    const payload = {
      token: user.token,
      topic: topic,
      language: language,
      number_flashcard: flashcardCount,
      user_id: user.user_id // FIX: Use user_id here too
    };

    console.log(" Flashcard Request:", `/flashcard/flashcard/${user.user_id}/`, payload);

    const response = await apiClient.post(
      `/flashcard/flashcard/${user.user_id}/`, // FIX: Use user_id here
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" Flashcard Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Flashcard generation error:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message || "Failed to generate flashcards";
  }
};


// // ✅ Get topic suggestions
export const getTopicSuggestions = async (topic) => {
  try {
    const response = await apiClient.post(
      "/flashcard/suggestion/",
      { topic },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Suggestion fetch error:", error.response?.data || error.message);
    throw error.response?.data || error.message || "Failed to fetch suggestions";
  }
};








export const createSummaryNote = async (payload, type, isFileType) => {
  try {
    // Get user data from storage
    const userString = await AsyncStorage.getItem("user");
    if (!userString) throw new Error("Login required");

    const user = JSON.parse(userString);
    const token = await AsyncStorage.getItem("userToken");
    
    if (!user.userId || !token) {
      throw new Error("User authentication required");
    }

    const endpoint = `summarynotes/summary_notes/${user.userId}/`;

    let body;
    let headers = {
      Authorization: `Bearer ${token}`,
    };

    if (isFileType) {
      // Build multipart form-data for file uploads
      const formData = new FormData();
      
      // Append the file
      formData.append(type, {
        uri: payload[type].uri,
        type: payload[type].type || "application/octet-stream",
        name: payload[type].name || `${type}-file`,
      });
      
      // Append other fields
      formData.append("language", payload.language || "en");
      formData.append("token", token);
      formData.append("user_id", user.userId);
      
      body = formData;
      // Don't set Content-Type header for FormData - React Native will set it automatically
    } else {
      // JSON payload for text/URL
      body = JSON.stringify({
        ...payload,
        token: token,
        user_id: user.userId
      });
      headers["Content-Type"] = "application/json";
    }

    console.log("Sending summary request:", { endpoint, body: isFileType ? "FormData" : body, headers });

    const response = await apiClient.post(endpoint, body, { headers });
    
    // Log the response for debugging
    console.log("Summary response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("Summary note creation error:", error);
    
    // Provide more specific error messages
    if (error.response?.status === 402) {
      throw new Error("Insufficient credits. Please upgrade your plan.");
    } else if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please login again.");
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(error.message || "Failed to create summary");
    }
  }
};


export default apiClient;

