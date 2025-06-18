// components/ForgotPasswordModal.jsx
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import CustomModal from './CustomModal';
import { forgotPassword } from '../services/apiClient';

const ForgotPasswordModal = ({ visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return setMessage('Email is required');
    setLoading(true);
    setMessage('');
    try {
      const res = await forgotPassword(email);
      setMessage(res.message || 'Instructions sent!');
    } catch (err) {
      setMessage(err.message || 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal visible={visible} onClose={onClose} title="Reset Password">
      <TextInput
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        className="border border-gray-300 rounded px-3 py-2 mb-3"
      />
      {loading ? (
        <ActivityIndicator color="#1e40af" className="mb-3" />
      ) : (
        <TouchableOpacity onPress={handleSubmit} className="bg-blue-600 rounded py-2 mb-3">
          <Text className="text-white text-center font-semibold">Send Reset Link</Text>
        </TouchableOpacity>
      )}
      {message ? <Text className="text-center text-sm text-blue-600">{message}</Text> : null}
    </CustomModal>
  );
};

export default ForgotPasswordModal;
