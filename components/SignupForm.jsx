// import React, { useEffect, useState } from 'react';
// import {
//   TextInput,
//   TouchableOpacity,
//   Text,
//   ActivityIndicator,
//   View,
//   PermissionsAndroid,
//   Platform,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import Geolocation from 'react-native-geolocation-service';
// import { signup } from '../services/apiClient';

// const SignupForm = ({ onSwitch, onSuccess }) => {
//   const [fullName, setFullName] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [country, setCountry] = useState('');
//   const [state, setState] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [geoLoading, setGeoLoading] = useState(true);
//   const [geoError, setGeoError] = useState('');

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

//   const handleSignup = async () => {
//     setMessage('');

//     if (password !== confirmPassword) {
//       setMessage('Passwords do not match.');
//       return;
//     }

//     setLoading(true);
//     console.log("data", country, state)
//     try {
//       const res = await signup({
//         full_name: fullName,
//         phone_number: phoneNumber,
//         email,
//         password,
//         country,
//         state,
//       });

//       if (res.success) {
//         onSuccess(email);
//       } else {
//         setMessage(res.message || 'Signup failed');
//       }
//     } catch {
//       setMessage('Signup failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View>
//       <TextInput
//         placeholder="Full Name"
//         placeholderTextColor="black"
//         className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
//         value={fullName}
//         onChangeText={setFullName}
//       />
//       <TextInput
//         placeholder="Phone Number"
//         placeholderTextColor="black"
//         keyboardType="phone-pad"
//         className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
//         value={phoneNumber}
//         onChangeText={setPhoneNumber}
//       />
//       <TextInput
//         placeholder="Email"
//         placeholderTextColor="black"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         placeholder="Country"
//         placeholderTextColor="black"
//         className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
//         value={country}
//         onChangeText={setCountry}
//       />
//       <TextInput
//         placeholder="State"
//         placeholderTextColor="black"
//         className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
//         value={state}
//         onChangeText={setState}
//       />

//       {/* Password Field */}
//       <View className="relative mb-3">
//         <TextInput
//           placeholder="Password"
//           placeholderTextColor="black"
//           secureTextEntry={!showPassword}
//           className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
//           value={password}
//           onChangeText={setPassword}
//         />
//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">
//           <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
//         </TouchableOpacity>
//       </View>

//       {/* Confirm Password Field */}
//       <View className="relative mb-3">
//         <TextInput
//           placeholder="Confirm Password"
//           placeholderTextColor="black"
//           secureTextEntry={!showConfirmPassword}
//           className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
//           value={confirmPassword}
//           onChangeText={setConfirmPassword}
//         />
//         <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5">
//           <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
//         </TouchableOpacity>
//       </View>

//       {geoLoading && (
//         <Text className="text-xs text-gray-500 mb-2">Detecting location...</Text>
//       )}
//       {geoError ? (
//         <Text className="text-xs text-red-500 mb-2">{geoError}</Text>
//       ) : null}

//       {loading ? (
//         <ActivityIndicator size="small" color="#1e40af" className="mb-3" />
//       ) : (
//         <TouchableOpacity onPress={handleSignup} className="bg-blue-600 rounded py-2 mb-3">
//           <Text className="text-white text-center font-semibold">Sign Up</Text>
//         </TouchableOpacity>
//       )}

//       {message && <Text className="text-center text-red-600 text-sm mb-2">{message}</Text>}

//       <TouchableOpacity onPress={onSwitch} className="mt-4">
//         <Text className="text-blue-600 text-sm text-center">Already have an account? Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default SignupForm;





import React, { useEffect, useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import { signup } from '../services/apiClient';

const SignupForm = ({ onSwitch, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState('');

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
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
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

  const handleSignup = async () => {
    setMessage('');

    if (!fullName || !phoneNumber || !email || !password || !confirmPassword) {
      setMessage('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await signup({
        full_name: fullName,
        phone_number: phoneNumber,
        email,
        password,
        country,
        state,
      });

      if (res.success) {
        Alert.alert('Signup Successful', 'You can now login', [{ text: 'OK', onPress: () => onSuccess(email) }]);
      } else {
        setMessage(res.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setMessage(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
      />

      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
      />

      <TextInput
        placeholder="Country"
        value={country}
        onChangeText={setCountry}
        placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
      />

      <TextInput
        placeholder="State"
        value={state}
        onChangeText={setState}
        placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
      />

      {/* Password */}
      <View className="relative mb-3">
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="black"
          className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View className="relative mb-3">
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          placeholderTextColor="black"
          className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5">
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {geoLoading && <Text className="text-xs text-gray-500 mb-2">Detecting location...</Text>}
      {geoError ? <Text className="text-xs text-red-500 mb-2">{geoError}</Text> : null}

      {loading ? (
        <ActivityIndicator size="small" color="#1e40af" className="mb-3" />
      ) : (
        <TouchableOpacity onPress={handleSignup} className="bg-blue-600 rounded py-2 mb-3">
          <Text className="text-white text-center font-semibold">Sign Up</Text>
        </TouchableOpacity>
      )}

      {message && <Text className="text-center text-red-600 text-sm mb-2">{message}</Text>}

      <TouchableOpacity onPress={onSwitch} className="mt-4">
        <Text className="text-blue-600 text-sm text-center">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupForm;
