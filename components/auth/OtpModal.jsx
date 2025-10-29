import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Alert } from 'react-native';
import CustomModal from '../common/CustomModal';
import { verifyOtp } from '../../services/apiClient';

const OtpModal = ({ visible, onClose, email, onVerified }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
  setLoading(true);
  setMessage('');
  try {
    const res = await verifyOtp({ email, otp });
    if (res.success) {
      setSuccess(true);
      // Show alert
      Alert.alert("Success", "OTP correct, login successful!", [
        { text: "OK", onPress: () => {
          setOtp('');
          setMessage('');
          onVerified && onVerified(res); // callback
          onClose();
        } }
      ]);
    } else {
      setSuccess(false);
      setMessage(res.message || 'Invalid OTP.');
    }
  } catch (err) {
    setSuccess(false);
    setMessage(typeof err === 'string' ? err : 'OTP verification failed.');
  } finally {
    setLoading(false);
  }
};


  return (
    <CustomModal visible={visible} onClose={onClose} title="Enter OTP">
      <Text className="text-center text-gray-700 mb-3">OTP sent to: {email}</Text>

      <TextInput
        placeholder="Enter OTP"
         placeholderTextColor="black"
        keyboardType="number-pad"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
        value={otp}
        onChangeText={setOtp}
      />

      {loading ? (
        <ActivityIndicator size="small" color="#22c55e" className="mb-3" />
      ) : (
        <TouchableOpacity onPress={handleVerify} className="bg-blue-600 rounded py-2 mb-3">
          <Text className="text-white text-center font-semibold">Verify OTP</Text>
        </TouchableOpacity>
      )}

      {message ? (
        <Text className={`text-center text-sm ${success ? 'text-green-600' : 'text-red-600'}`}>{message}</Text>
      ) : null}
    </CustomModal>
  );
};

export default OtpModal;
