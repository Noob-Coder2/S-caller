import { AppState } from 'react-native';
import { store } from '../store/store';
import { handleError } from '../utils/errorHandler';

let backgroundTask: NodeJS.Timeout | null = null;

export const setupBackgroundTask = () => {
  const handleAppStateChange = (nextState: string) => {
    try {
      if (nextState === 'background' && store.getState().call.sequenceState?.isRunning) {
        if (!backgroundTask) {
          backgroundTask = setInterval(() => {
            console.log('Background task keeping sequence alive');
            // You can add additional logic here to update or maintain the call sequence state
          }, 10000);
        }
      } else {
        if (backgroundTask) {
          clearInterval(backgroundTask);
          backgroundTask = null;
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  AppState.addEventListener('change', handleAppStateChange);
};

export const fetchCallLogs = () => {
  return store.getState().call.callHistory;
};


export const cleanupBackgroundTask = () => {
  if (backgroundTask) {
    clearInterval(backgroundTask);
    backgroundTask = null;
  }
};
