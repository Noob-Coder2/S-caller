import { Linking, Platform } from 'react-native';
import { store } from '../store/store';
import CallDetectorManager from 'react-native-call-detection';
import { addCallLog, startSequence, setSequenceError, updateSequenceProgress, endSequence, updateFormData } from "../store/callSlice";

let callDetector: any = null;
let callStartTime: number = 0;
let callTimeout: NodeJS.Timeout | null = null;
const CALL_TIMEOUT_MS = 60000; // 1 minute timeout
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

export const initializeCallDetection = () => {
  cleanupCallDetection(); // Cleanup any existing detector

  if (Platform.OS === 'android' && !callDetector) {
    callDetector = new CallDetectorManager(
      (event: string) => {
        handleCallStates(event);
      },
      true, // Read phone state permission
      () => {
        console.log('Call detection failed to initialize');
        store.dispatch(setSequenceError('Call detection initialization failed'));
      },
      {
        title: 'Phone State Permission',
        message: 'This app needs access to your phone state in order to react to incoming calls.',
      }
    );
  }
};

export const cleanupCallDetection = () => {
  if (callDetector) {
    callDetector.dispose();
    callDetector = null;
  }
  if (callTimeout) {
    clearTimeout(callTimeout);
    callTimeout = null;
  }
};

const handleCallStates = (event: string) => {
  const state = store.getState().call;

  switch (event) {
    case 'Connected':
      callStartTime = Date.now();
      store.dispatch(updateFormData({ lastCallAnswered: true }));
      // Set timeout for long calls
      callTimeout = setTimeout(() => {
        handleCallTimeout();
      }, CALL_TIMEOUT_MS);
      break;
    
    case 'Disconnected':
      if (callTimeout) {
        clearTimeout(callTimeout);
        callTimeout = null;
      }
      const duration = Date.now() - callStartTime;
      store.dispatch(addCallLog({
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type: 'call',
        status: duration > 0 ? 'success' : 'failed',
        duration,
        phoneNumber: state.formData.phoneNumber
      }));
      break;
    
    case 'Missed':
    case 'Rejected':
    case 'Busy':
      store.dispatch(addCallLog({
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type: 'call',
        status: 'rejected/missed/busy',
        phoneNumber: state.formData.phoneNumber
      }));
      break;
      default:
      // Fallback for unknown states
      setTimeout(() => {
        if (!state.sequenceState.isRunning) return;
        store.dispatch(addCallLog({
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type: 'call',
          status: 'unknown',
          phoneNumber: state.formData.phoneNumber,
          note: 'Call status not detected',
        }));
      }, CALL_TIMEOUT_MS);
  }
};

const handleCallTimeout = () => {
  store.dispatch(addCallLog({
    id: `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    type: 'call',
    status: 'failed',
    phoneNumber: store.getState().call.formData.phoneNumber
  }));
};

export const makeCall = async (phoneNumber: string, retryCount = 0): Promise<boolean> => {
  try {
    const url = `tel:${phoneNumber}`;
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      throw new Error('Phone calling not supported');
    }

    store.dispatch(addCallLog({
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: 'call',
      status: 'pending',
      phoneNumber,
    }));

    await Linking.openURL(url);
    return true;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return makeCall(phoneNumber, retryCount + 1);
    }

    store.dispatch(addCallLog({
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: 'call',
      status: 'failed',
      phoneNumber,
      message: error instanceof Error ? error.message : 'Call failed',
    }));
    return false;
  }
};

export const makeSequentialCalls = async (
  phoneNumber: string,
  numberOfCalls: number,
  delayBetweenCalls: number = 3000
) => {
  try {
    store.dispatch(startSequence({ totalSteps: numberOfCalls }));
    initializeCallDetection();

    for (let i = 0; i < numberOfCalls; i++) {
      const success = await makeCall(phoneNumber);
      store.dispatch(updateSequenceProgress());

      if (!success && i < numberOfCalls - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls * 2)); // Double delay after failure
      } else if (i < numberOfCalls - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
      }
    }
  } catch (error) {
    store.dispatch(setSequenceError(
      error instanceof Error ? error.message : 'Sequence failed'
    ));
    throw error;
  } finally {
    store.dispatch(endSequence());
    cleanupCallDetection();
  }
};