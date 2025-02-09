import { Platform, PermissionsAndroid } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';

type PermissionType = 'call' | 'sms' | 'contacts';

const getPermissionByPlatform = (type: PermissionType): Permission => {
  const permissions = {
    ios: {
      call: PERMISSIONS.IOS.CONTACTS, // iOS doesn't have direct CALL permission
      sms: PERMISSIONS.IOS.CONTACTS,  // iOS doesn't have direct SMS permission
      contacts: PERMISSIONS.IOS.CONTACTS
    },
    android: {
      call: PERMISSIONS.ANDROID.CALL_PHONE,
      sms: PERMISSIONS.ANDROID.SEND_SMS,
      contacts: PERMISSIONS.ANDROID.READ_CONTACTS
    }
  };

  return Platform.select({
    ios: permissions.ios[type],
    android: permissions.android[type],
    default: permissions.android[type]
  });
};

const checkPermission = async (type: PermissionType): Promise<boolean> => {
  const permission = getPermissionByPlatform(type);
  
  try {
    const result = await check(permission);
    switch (result) {
      case RESULTS.GRANTED:
        return true;
      case RESULTS.DENIED:
      case RESULTS.BLOCKED:
      case RESULTS.LIMITED:
        return false;
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking ${type} permission:`, error);
    return false;
  }
};

export const requestPermissions = async () => {
  const permissionsToRequest: PermissionType[] = ['call', 'sms', 'contacts'];
  const results: Record<PermissionType, boolean> = {
    call: false,
    sms: false,
    contacts: false
  };

  for (const type of permissionsToRequest) {
    const permission = getPermissionByPlatform(type);
    try {
      // First check if we already have permission
      let isGranted = await checkPermission(type);
      
      if (!isGranted) {
        // Request permission if we don't have it
        const result = await request(permission);
        isGranted = result === RESULTS.GRANTED;
      }

      results[type] = isGranted;

    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      results[type] = false;
    }
  }

  return {
    allGranted: Object.values(results).every(result => result),
    results
  };
};
