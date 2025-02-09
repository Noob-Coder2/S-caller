import { Alert } from 'react-native';
import { setSequenceError } from '../store/callSlice';
import { store } from '../store/store';

type ErrorType = 'permission' | 'network' | 'validation' | 'rate_limit' | 'unknown';

export const handleError = (error: unknown, context?: string) => {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  const type: ErrorType = determineErrorType(message);

  switch (type) {
    case 'permission':
      Alert.alert('Permission Required', 'Please enable phone and SMS permissions in settings.');
      break;
    case 'network':
      Alert.alert('Network Error', 'Please check your internet connection and try again.');
      break;
    case 'validation':
      Alert.alert('Invalid Input', message);
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
  if (message.toLowerCase().includes('permission')) return 'permission';
  if (message.toLowerCase().includes('network')) return 'network';
  if (message.toLowerCase().includes('invalid')) return 'validation';
  if (message.toLowerCase().includes('rate limit')) return 'rate_limit';
  return 'unknown';
};