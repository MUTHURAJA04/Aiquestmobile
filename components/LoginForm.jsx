// import React, { useState, useEffect } from 'react';
// import {
//   TextInput,
//   TouchableOpacity,
//   Text,
//   ActivityIndicator,
//   View,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { loginUser } from '../services/apiClient';
// import Geolocation from 'react-native-geolocation-service';

// const LoginForm = ({ onSwitch, onLogin, prefillEmail = '', onForgotPasswordClick }) => {
//   const [email, setEmail] = useState(prefillEmail);
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [country, setCountry] = useState('');
//   const [state, setState] = useState('');
//   const [geoLoading, setGeoLoading] = useState(true);
//   const [geoError, setGeoError] = useState('');

//   useEffect(() => {
//     GoogleSignin.configure({
//       webClientId: '660164904994-3vv7hpq7u3fp6gs2gchj6vrm16krm1va.apps.googleusercontent.com',
//       offlineAccess: true,
//     });

//     if (prefillEmail) setEmail(prefillEmail);
//   }, [prefillEmail]);

//   const handleLogin = async () => {
//     setLoading(true);
//     setMessage('');
//     try {
//       const result = await loginUser({ email, password });

//       if (result.success) {
//         await AsyncStorage.setItem('user', JSON.stringify(result));
//         onLogin(result);
//       } else {
//         setMessage(result.message || 'Invalid credentials');
//       }
//     } catch (err) {
//       setMessage('Login failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     const requestLocationPermission = async () => {
//       try {
//         if (Platform.OS === 'android') {
//           const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
//           );
//           if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//             setGeoError('Location permission denied');
//             setGeoLoading(false);
//             return;
//           }
//         }

//         Geolocation.getCurrentPosition(
//           (position) => {
//             const { latitude, longitude } = position.coords;

//             fetch(
//               `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
//              )
//               .then((res) => res.json())
//               .then((data) => {
//                 if (data?.address) {
//                   setCountry(data.address.country || '');
//                   setState(data.address.state || '');
//                 } else {
//                   setGeoError('Location not found');
//                 }
//                 setGeoLoading(false);
//               })
//               .catch((err) => {
//                 console.error('Fetch error:', err);
//                 setGeoError('Failed to fetch location');
//                 setGeoLoading(false);
//               });
//           },
//           (error) => {
//             console.error('Geolocation error:', error);
//             setGeoError('Unable to get location');
//             setGeoLoading(false);
//           },
//           { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//         );
//       } catch (err) {
//         console.error('Permission error:', err);
//         setGeoError('Permission error');
//         setGeoLoading(false);
//       }
//     };

//     requestLocationPermission();
//   }, []);


// const handleGoogleLogin = async () => {
//   try {
//     console.log('🔍 Checking Play Services...');
//     await GoogleSignin.hasPlayServices();

//     console.log('🚀 Starting Google Sign-In...');
//     const userInfo = await GoogleSignin.signIn();

//     console.log('✅ Google Sign-In Success:', JSON.stringify(userInfo, null, 2));

//     // ✅ Correct destructuring
//     const { user, idToken } = userInfo?.data || {};

//     if (!user || !idToken) {
//       throw new Error('Missing user or idToken from Google response');
//     }
//    const location = {
//       country: 'India',
//       state: 'Tamil Nadu',
//     };
    
//     const ssoPayload = {
//     google_id_token: idToken,
//       country: location.country,
//       state: location.state,

//     };

//     console.log('📦 Sending payload to backend:', ssoPayload);

//     const res = await loginUser(ssoPayload); // your backend call

//     if (res?.success) {
//       await AsyncStorage.setItem('user', JSON.stringify(res));
//       console.log('✅ Saved user to storage');
//       onLogin?.(res); // call parent if exists
//     } else {
//       console.warn('⚠️ Backend error:', res?.message);
//       setMessage(res?.message || 'Google SSO login failed');
//     }

//   } catch (error) {
//     const msg = error?.message || JSON.stringify(error) || 'Unknown error';
//     console.error('❌ Google Sign-In error:', msg);
//     Alert.alert('Google Login Error', msg);
//   }
// };



//   return (
//     <View>
//       <TextInput
//         placeholder="Email"
//         placeholderTextColor="black"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
//         value={email}
//         onChangeText={setEmail}
//       />

//       <View className="relative mb-3">
//         <TextInput
//           placeholder="Password"
//           placeholderTextColor="black"
//           secureTextEntry={!showPassword}
//           className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
//           value={password}
//           onChangeText={setPassword}
//         />
//         <TouchableOpacity
//           onPress={() => setShowPassword(!showPassword)}
//           className="absolute right-3 top-2.5"
//         >
//           <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity onPress={onForgotPasswordClick}>
//         <Text className="text-blue-600 text-sm mb-3 text-right">Forgot Password?</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="small" color="#1e40af" className="mb-3" />
//       ) : (
//         <>
//           <TouchableOpacity onPress={handleLogin} className="bg-blue-600 rounded py-2 mb-3">
//             <Text className="text-white text-center font-semibold">Login</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={handleGoogleLogin}
//             className="bg-red-600 rounded py-2 mb-3 flex-row items-center justify-center"
//           >
//             <Ionicons name="logo-google" size={20} color="white" />
//             <Text className="text-white text-center font-semibold ml-2">Continue with Google</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {message ? (
//         <Text className="text-center text-red-600 text-sm mb-2">{message}</Text>
//       ) : null}

//       <TouchableOpacity onPress={onSwitch} className="mt-2">
//         <Text className="text-blue-600 text-sm text-center">No account? Sign Up</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default LoginForm;

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
import { loginUser } from '../services/apiClient';
import Geolocation from 'react-native-geolocation-service';

const LoginForm = ({ onSwitch, onLogin, prefillEmail = '', onForgotPasswordClick }) => {
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState('');

  // Google Sign-In configuration
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '666282751382-h6qrk8e5jrkn8v104m08t8vmc6so93n3.apps.googleusercontent.com',
      offlineAccess: true,
    });

    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  // Geolocation setup
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setGeoError('Location permission denied');
            setGeoLoading(false);
            return;
          }
        }

        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
              .then((res) => res.json())
              .then((data) => {
                setCountry(data?.address?.country || '');
                setState(data?.address?.state || '');
                setGeoLoading(false);
              })
              .catch((err) => {
                console.error('Fetch error:', err);
                setGeoError('Failed to fetch location');
                setGeoLoading(false);
              });
          },
          (error) => {
            console.error('Geolocation error:', error);
            setGeoError('Unable to get location');
            setGeoLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch (err) {
        console.error('Permission error:', err);
        setGeoError('Permission error');
        setGeoLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  // Email/password login
  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await loginUser({
        email,
        password,
        country,
        state,
      });

      if (result.success) {
        await AsyncStorage.setItem('user', JSON.stringify(result));
        onLogin(result);
      } else {
        setMessage(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      console.log('🔍 Checking Play Services...');
      await GoogleSignin.hasPlayServices();

      console.log('🚀 Starting Google Sign-In...');
      const userInfo = await GoogleSignin.signIn();

      console.log('✅ Google Sign-In Success:', JSON.stringify(userInfo, null, 2));
      // ✅ Correct destructuring
    const { user, idToken } = userInfo?.data || {};

    if (!user || !idToken) {
      throw new Error('Missing user or idToken from Google response');
    }

      const ssoPayload = {
        google_id_token: idToken,
        country: country || 'Unknown',
        state: state || 'Unknown',
      };

      console.log('📦 Sending payload to backend:', ssoPayload);

      const res = await loginUser(ssoPayload);

      if (res?.success) {
        await AsyncStorage.setItem('user', JSON.stringify(res));
        console.log('✅ Saved user to storage');
        onLogin?.(res);
      } else {
        console.warn('⚠️ Backend error:', res?.message);
        setMessage(res?.message || 'Google login failed');
      }
    } catch (error) {
      const msg = error?.message || JSON.stringify(error) || 'Unknown error';
      console.error('❌ Google Sign-In error:', msg);
      Alert.alert('Google Login Error', msg);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        placeholderTextColor="black"
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
        value={email}
        onChangeText={setEmail}
      />

      <View className="relative mb-3">
        <TextInput
          placeholder="Password"
          placeholderTextColor="black"
          secureTextEntry={!showPassword}
          className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5"
        >
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {geoLoading && (
        <Text className="text-xs text-gray-500 mb-2">Detecting location...</Text>
      )}
      {geoError ? (
        <Text className="text-xs text-red-500 mb-2">{geoError}</Text>
      ) : null}
      
      <TouchableOpacity onPress={onForgotPasswordClick}>
        <Text className="text-blue-600 text-sm mb-3 text-right">Forgot Password?</Text>
      </TouchableOpacity>

      {loading ? (
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
            <Text className="text-white text-center font-semibold ml-2">Continue with Google</Text>
          </TouchableOpacity>
        </>
      )}

      {message ? (
        <Text className="text-center text-red-600 text-sm mb-2">{message}</Text>
      ) : null}

      <TouchableOpacity onPress={onSwitch} className="mt-2">
        <Text className="text-blue-600 text-sm text-center">No account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;
