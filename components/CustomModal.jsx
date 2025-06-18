import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomModal = ({ visible, onClose, title, children }) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar animated backgroundColor="#000000" barStyle="light-content" />
      <Pressable 
        className="flex-1 bg-black/30 justify-center items-center" 
        onPress={onClose}
      >
        <View className="w-4/5 max-w-[350px]">
          <Pressable 
            className="bg-white rounded-2xl p-5 shadow-lg"
            onPress={(e) => e.stopPropagation()} 
          >
            {/* Header with title and close button */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold">{title}</Text>
              <TouchableOpacity 
                onPress={onClose}
                className="p-1"
              >
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              {children}
            </View>

           
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default CustomModal;