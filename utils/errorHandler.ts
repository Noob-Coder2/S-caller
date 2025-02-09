import { Alert, Linking } from 'react-native';
import { setSequenceError } from '../store/callSlice';
import { store } from '../store/store';
import * as FileSystem from 'expo-file-system';

type ErrorType = 
  | 'permission'
  | 'network'
  | 'validation'
  | 'rate_limit'
  | 'call_failed'
  | 'timeout'
  | 'background_task'
  | 'storage'
  | 'contact_access'
  | 'unknown';

interface ErrorLog {
  timestamp: number;
  type: ErrorType;
  message: string;
  context?: string;
}

const ERROR_LOG_FILE = `${FileSystem.documentDirectory}error_logs.json`;

export const handleError = async (error: unknown, context?: string) => {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  const type: ErrorType = determineErrorType(message);

  // Log error
  await logError({
    timestamp: Date.now(),
    type,
    message,
    context
  });

  // Show appropriate alert
  switch (type) {
    case 'permission':
      Alert.alert(
        'Permission Required',
        'Please enable required permissions in settings.',
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      break;
    case 'network':
      Alert.alert(
        'Network Error',
        'Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => store.dispatch({ type: 'RETRY_LAST_ACTION' }) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      break;
    case 'call_failed':
      Alert.alert(
        'Call Failed',
        'Unable to complete the call. Please try again.',
        [
          { text: 'Retry', onPress: () => store.dispatch({ type: 'RETRY_LAST_CALL' }) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      break;
    case 'timeout':
      Alert.alert('Timeout', 'The operation timed out. Please try again.');
      break;
    case 'rate_limit':
      Alert.alert('Rate Limit Exceeded', 'Please wait before making more calls.');
      break;
    default:
      Alert.alert('Error', `Something went wrong: ${message}`);
  }

  store.dispatch(setSequenceError(message));
};

const determineErrorType = (message: string): ErrorType => {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('permission')) return 'permission';
  if (lowerMessage.includes('network') || lowerMessage.includes('internet')) return 'network';
  if (lowerMessage.includes('invalid')) return 'validation';
  if (lowerMessage.includes('rate limit')) return 'rate_limit';
  if (lowerMessage.includes('call failed')) return 'call_failed';
  if (lowerMessage.includes('timeout')) return 'timeout';
  if (lowerMessage.includes('background')) return 'background_task';
  if (lowerMessage.includes('storage')) return 'storage';
  if (lowerMessage.includes('contacts')) return 'contact_access';
  return 'unknown';
};

const logError = async (errorLog: ErrorLog) => {
  try {
    let logs: ErrorLog[] = [];
    
    // Read existing logs
    try {
      const fileContent = await FileSystem.readAsStringAsync(ERROR_LOG_FILE);
      logs = JSON.parse(fileContent);
    } catch {
      // File doesn't exist or is corrupt, start with empty logs
    }

    // Add new log
    logs.push(errorLog);

    // Keep only last 100 logs
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }

    // Write back to file
    await FileSystem.writeAsStringAsync(ERROR_LOG_FILE, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to log error:', e);
  }
};

export const getErrorLogs = async (): Promise<ErrorLog[]> => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(ERROR_LOG_FILE);
    return JSON.parse(fileContent);
  } catch {
    return [];
  }
};

export const clearErrorLogs = async (): Promise<void> => {
  try {
    await FileSystem.deleteAsync(ERROR_LOG_FILE);
  } catch (e) {
    console.error('Failed to clear error logs:', e);
  }
};