import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { requestPermissions } from '../services/PermissionService';
import { useDispatch } from 'react-redux';
import { setPermissions } from '../store/callSlice';

interface PermissionHandlerProps {
  onPermissionGranted: () => void;
  onPermissionDenied?: () => void;
}

const PermissionHandler: React.FC<PermissionHandlerProps> = ({
  onPermissionGranted,
  onPermissionDenied
}) => {
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      try {
        const { allGranted, results } = await requestPermissions();
        
        dispatch(setPermissions({
          callPhone: results.call,
          sendSms: results.sms,
          accessContacts: results.contacts
        }));

        if (allGranted) {
          onPermissionGranted();
        } else {
          const deniedPermissions = Object.entries(results)
            .filter(([_, granted]) => !granted)
            .map(([type]) => type)
            .join(', ');

          const message = Platform.select({
            ios: `This app requires ${deniedPermissions} permissions to function properly. Please enable them in your device settings.`,
            android: `This app requires ${deniedPermissions} permissions to function properly. Please grant the permissions when prompted.`,
            default: 'Required permissions were not granted.'
          });

          Alert.alert(
            'Permission Required',
            message,
            [
              { 
                text: 'OK', 
                onPress: () => onPermissionDenied?.() 
              }
            ]
          );
        }
      } catch (error) {
        console.error('Permission request error:', error);
        Alert.alert(
          'Error',
          'Failed to request necessary permissions. Please try again.'
        );
        onPermissionDenied?.();
      } finally {
        setIsChecking(false);
      }
    };

    checkAndRequestPermissions();
  }, [dispatch, onPermissionGranted, onPermissionDenied]);

  // Return null as this is a utility component
  return null;
};

export default PermissionHandler;