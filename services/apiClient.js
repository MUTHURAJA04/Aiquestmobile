import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
   
    return Promise.reject(error);
  }
);


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
    // ✅ Clean error handling with friendly messages
    if (error.response) {
      const status = error.response.status;
      let message = 'Login failed. Please try again.';

      if (status === 404) {
        message = 'User not found. Please check your email.';
      } else if (status === 401) {
        message = 'Incorrect password. Please try again.';
      } else if (status >= 500) {
        message = 'Server error. Please try again later.';
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }

      return { success: false, message };
    } else if (error.request) {
      return {
        success: false,
        message: 'No response from server. Please check your internet connection.',
      };
    } else {
      return {
        success: false,
        message: 'Unexpected error occurred during login.',
      };
    }
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
        timeout: 180000, // ✅ Increased to 3 minutes for audio files
      }
    );
    
    const data = response.data;
   
    
    return data;

  } catch (error) {
    
    
    // ✅ Better network error detection
    if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
      throw new Error("Network connection failed. Please check your internet connection and try again.");
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The audio file might be too large. Try a smaller file.");
    }
    
    if (!error.response) {
      throw new Error("Network error. Please check your connection and try again.");
    }
    
    // Handle backend errors
    const errorData = error.response?.data || {};
    throw new Error(errorData.error || errorData.message || "Quiz generation failed");
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

      throw new Error(response.data.message || "Failed to fetch dashboard data");
    }

  } catch (error) {
    // 🔹 Handle network / server errors
    if (error.response) {
      // Server responded with error
    

      // Check if backend returned status 0 with message
      if (error.response.data && error.response.data.status === 0) {
        throw new Error(error.response.data.message || "Dashboard request failed");
      }

      throw error.response.data;
    } else if (error.request) {
      // No response from server

      throw new Error("No response from server. Please try again.");
    } else {
      // Other error
 
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

    throw error;
  }
};

// Verify Payment
export const verifyPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/payments/payment/verify/', paymentData);
    return response.data;
  } catch (error) {
   
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
    
    throw error;
  }
};


//  generateFlashcards 
export const generateFlashcards = async (topic, language = "en") => {
  try {
    const userString = await AsyncStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const flashcardCount = await AsyncStorage.getItem("flashcard_count") || "10";

  

    // FIX: Use user_id instead of userId
    if (!user?.userId || !user?.token) {
      throw new Error("Missing userId or token in AsyncStorage. Please login again.");
    }

    const payload = {
      token: user.token,
      topic: topic,
      language: language,
      number_flashcard: flashcardCount,
      user_id: user.userId  // send userId to backend as user_id
    };

    const response = await apiClient.post(
      `/flashcard/flashcard/${user.userId}/`,  // use userId here
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );


    return response.data;
  } catch (error) {
   
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

    throw error.response?.data || error.message || "Failed to fetch suggestions";
  }
};



export const createSummaryNote = async ({ type, language, input, file }) => {
  try {
    const userStr = await AsyncStorage.getItem("user");
    if (!userStr) throw new Error("User not logged in");

    const user = JSON.parse(userStr);
    const userId = user?.userId;
    const token = user?.token;

    if (!userId || !token) {
      throw new Error("User not logged in");
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("language", language || "en");

    if (type === "text" || type === "url") {
      formData.append("text", input);
    } else if (file) {
      formData.append("file", {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
    } else {
      throw new Error("No input content");
    }

    const response = await fetch(
      `https://dev-api.digiaiquest.com/summarynotes/summary_notes/${userId}/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      }
    );

    const data = await response.json();
 

    if (!response.ok || data.status === 0) {
      throw new Error(data.error || "Summary generation failed");
    }

    return data;
  } catch (error) {
   
    throw error;
  }
};



// ✅ Get Delete Reasons
export const getDeleteReasons = async () => {
  try {
    const response = await apiClient.get("app2/deletereasons/"); // ✅ Added app2/
 
    return response.data;
  } catch (error) {
    
    throw new Error("Failed to fetch delete reasons");
  }
};

// ✅ Delete User Account
export const deleteUserAccount = async ({ userId, token, reason_id, comments }) => {
  try {
    const payload = comments ? { reason_id, comments } : { reason_id };

    const response = await apiClient.post(
      `app2/deleteuser/${userId}/`, // ✅ Added app2/
      payload,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );


    return response.data;
  } catch (error) {

    throw new Error(error.response?.data?.error || "Failed to delete user account.");
  }
};




export default apiClient;

