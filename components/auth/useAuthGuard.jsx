// hooks/useAuthGuard.js
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../navigations/AuthContext';

const useAuthGuard = () => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
    }
  }, [isAuthenticated, navigation]);

  return isAuthenticated;
};

export default useAuthGuard;