import { Linking, Platform } from 'react-native';
import { store } from '../store/store';
import CallDetectorManager from 'react-native-call-detection';
import { addCallLog, startSequence, setSequenceError, updateSequenceProgress, endSequence, updateFormData } from "../store/callSlice";

let callDetector: any = null;
let callStartTime: number = 0;

export const initializeCallDetection = () => {
  if (Platform.OS === 'android' && !callDetector) {
    callDetector = new CallDetectorManager((event: string) => {
      handleCallStates(event);
    });
  }
};

const handleCallStates = (event: string) => {
  const state = store.getState().call;

  switch (event) {
    case 'Connected':
      callStartTime = Date.now();
      store.dispatch(updateFormData({ lastCallAnswered: true }));
      break;
    
    case 'Disconnected':
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
        status: 'failed',
        phoneNumber: state.formData.phoneNumber
      }));
      break;
  }
};

export const makeCall = async (phoneNumber: string) => {
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
  } catch (error) {
    store.dispatch(addCallLog({
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: 'call',
      status: 'failed',
      phoneNumber,
      message: error instanceof Error ? error.message : 'Call failed',
    }));
    throw error;
  }
};

export const makeSequentialCalls = async (
  phoneNumber: string,
  numberOfCalls: number
) => {
  try {
    store.dispatch(startSequence({ totalSteps: numberOfCalls }));

    for (let i = 0; i < numberOfCalls; i++) {
      await makeCall(phoneNumber);
      store.dispatch(updateSequenceProgress());

      if (i < numberOfCalls - 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  } catch (error) {
    store.dispatch(setSequenceError(
      error instanceof Error ? error.message : 'Sequence failed'
    ));
    throw error;
  } finally {
    store.dispatch(endSequence());
  }
};
