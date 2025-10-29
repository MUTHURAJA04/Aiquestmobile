
import React, { useState, useEffect } from 'react';
import {
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Geolocation from 'react-native-geolocation-service';
import { useAuth } from '../navigations/AuthContext';
import { googleSSOLogin, loginUser } from '../../services/apiClient';


const LoginForm = ({ onSwitch, onLogin, prefillEmail = '', onForgotPasswordClick }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState('');
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "166620426117-fao3oh656sbjp40qf79gfk7r0nbtps2b.apps.googleusercontent.com",
      androidClientId: "166620426117-4p455dpjhipdokseuv60rcvuq4ebd6rc.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

//  ✅ Fixed Geolocation setup - Optional location
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app would like to access your location for better experience.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setLocationPermissionGranted(true);
            getCurrentLocation();
          } else {
            setLocationPermissionGranted(false);
            setGeoError('Location permission not granted - using default location');
            setGeoLoading(false);
          }
        } else {
          // For iOS, you can implement similar logic
          getCurrentLocation();
        }
      } catch (err) {
       
        setLocationPermissionGranted(false);
        setGeoError('Location permission error');
        setGeoLoading(false);
      }
    };

    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              {
                headers: {
                  'User-Agent': 'YourAppName/1.0 (your@email.com)',
                },
              }
            );

            const data = await res.json();
            setCountry(data?.address?.country || 'Unknown');
            setState(data?.address?.state || 'Unknown');
            setGeoLoading(false);
          } catch (err) {
          
            setCountry('Unknown');
            setState('Unknown');
            setGeoError('Failed to fetch location details');
            setGeoLoading(false);
          }
        },
        (error) => {
         
          setCountry('Unknown');
          setState('Unknown');
          setGeoError('Unable to get current location');
          setGeoLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    requestLocationPermission();
  }, []);


const validateForm = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) return 'Email is required';
  if (/\s/.test(email)) return 'Email cannot contain spaces';
  if (/^[^a-zA-Z0-9]/.test(email)) return 'Email cannot start with special character';
  if (/[.@]$/.test(email)) return 'Email cannot end with "." or "@"';
  if (!emailRegex.test(email)) return 'Enter a valid email address';
  if (email.length < 5 || email.length > 50) return 'Email must be between 5–50 characters';

  if (!password.trim()) return 'Password is required';
  if (/\s/.test(password)) return 'Password cannot contain spaces';
  if (password.length < 8 || password.length > 20)
    return 'Password must be between 8–20 characters';

  return null;
};



  // ✅ Fixed Email login - with fallback location
  const handleLogin = async () => {
    const error = validateForm();
    if (error) {
      setMessage(error);
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const result = await loginUser({
        email,
        password,
        country: country || 'Unknown', // Fallback value
        state: state || 'Unknown',     // Fallback value
      });

      if (result?.success) {
        await AsyncStorage.setItem('user', JSON.stringify(result));
        login(result, result.token);
        onLogin?.(result);
        Alert.alert("Login Successful", "You have logged in successfully!");
      } else {
        setMessage(result?.message || 'Invalid credentials');
      }
    } catch (err) {
  
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setMessage('');

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      

      const idToken = userInfo.idToken;
      if (!idToken) throw new Error("Missing Google ID token");

      const ssoPayload = {
        google_id_token: idToken,
        country: country || "Unknown", // Fallback value
        state: state || "Unknown",     // Fallback value
      };

      const result = await googleSSOLogin(ssoPayload);

      if (result?.success) {
        await AsyncStorage.setItem('user', JSON.stringify(result));
        login(result, result.token);
        onLogin?.(result);
        Alert.alert("Login Successful", result.message || "Welcome back!");
      } else {
        if (result.googleEmail) {
          setEmail(result.googleEmail);
          Alert.alert("Use Email Login", result.message, [{ text: "OK" }]);
        } else {
          setMessage(result?.message || "Google login failed");
          Alert.alert("Login Failed", result?.message || "Please try again.");
        }
      }
    } catch (error) {
     
      Alert.alert("Google Login Error", error?.message || "Unknown error");
    } finally {
      setGoogleLoading(false);
    }
  };

  const retryLocationPermission = async () => {
    setGeoLoading(true);
    setGeoError('');
    
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setLocationPermissionGranted(true);
        // Re-fetch location
        // You can call the location function again here
      } else {
        setGeoError('Location permission still denied');
      }
    }
    setGeoLoading(false);
  };

  return (
    <View>
      {/* Email */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="black"
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
        value={email}
        onChangeText={(text) => setEmail(text.replace(/\s/g, '').slice(0, 50))}
      />

      {/* Password */}
      <View className="relative mb-3">
        <TextInput
          placeholder="Password"
          placeholderTextColor="black"
          secureTextEntry={!showPassword}
          className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
          value={password}
          maxLength={20}
          onChangeText={(text) => setPassword(text.replace(/\s/g, ''))}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5"
        >
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {message ? (
        <Text className="text-center text-red-600 text-sm mb-2">{message}</Text>
      ) : null}

      {/* Location Status */}
      {geoLoading && (
        <Text className="text-xs text-gray-500 mb-2">Detecting location...</Text>
      )}
      {geoError ? (
        <View className="mb-2">
          <Text className="text-xs text-orange-500 mb-1">{geoError}</Text>
          <TouchableOpacity onPress={retryLocationPermission}>
            <Text className="text-xs text-blue-500">Retry Location</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!geoLoading && !geoError && (country || state) && (
        <Text className="text-xs text-green-600 mb-2">
          Location: {country}, {state}
        </Text>
      )}

      <TouchableOpacity onPress={() => onForgotPasswordClick?.()}>
        <Text className="text-blue-600 text-sm mb-3 text-right">Forgot Password?</Text>
      </TouchableOpacity>

      {loading || googleLoading ? (
        <ActivityIndicator size="small" color="#1e40af" className="mb-3" />
      ) : (
        <>
          <TouchableOpacity onPress={handleLogin} className="bg-blue-600 rounded py-2 mb-3">
            <Text className="text-white text-center font-semibold">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoogleLogin}
            className="bg-red-600 rounded py-2 mb-3 flex-row items-center justify-center"
          >
            <Ionicons name="logo-google" size={20} color="white" />
            <Text className="text-white text-center font-semibold ml-2">
              Continue with Google
            </Text>
          </TouchableOpacity>
        </>
      )}

      <View className="mt-2 flex-row justify-center">
        <Text className="text-sm">No account? </Text>
        <TouchableOpacity onPress={onSwitch}>
          <Text className="text-blue-600 text-sm underline">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginForm;

