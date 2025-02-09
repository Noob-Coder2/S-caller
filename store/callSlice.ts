import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CallState {
  callHistory: Array<{
    id: string;
    type: 'call' | 'sms';
    status: 'pending' | 'success' | 'failed';
    timestamp: number;
    duration?: number;
    message?: string;
    phoneNumber: string;
  }>;
  sequenceState: {
    isRunning: boolean;
    currentIndex: number;
    totalSteps: number;
    lastError?: string;
  };
  permissions: {
    callPhone: boolean;
    sendSms: boolean;
    accessContacts: boolean;
  };
  formData: {
    phoneNumber: string;
    numCalls: string;
    message: string;
    lastCallAnswered: boolean;
  };
}

const initialState: CallState = {
  callHistory: [],
  sequenceState: {
    isRunning: false,
    currentIndex: 0,
    totalSteps: 0,
  },
  permissions: {
    callPhone: false,
    accessContacts: false,
    sendSms: false,
  },
  formData: {
    phoneNumber: '',
    numCalls: '1',
    message: '',
    lastCallAnswered: false,
  },
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    startSequence(state, action: PayloadAction<{ totalSteps: number }>) {
      state.sequenceState = {
        isRunning: true,
        currentIndex: 0,
        totalSteps: action.payload.totalSteps,
        lastError: undefined,
      };
    },
    updateSequenceProgress(state) {
      state.sequenceState.currentIndex += 1;
    },
    endSequence(state) {
      state.sequenceState.isRunning = false;
    },
    addCallLog(state, action: PayloadAction<CallState['callHistory'][0]>) {
      const { id, timestamp, ...rest } = action.payload;
      state.callHistory.push({
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        ...rest,
      });
    },
    setPermissions(state, action: PayloadAction<CallState['permissions']>) {
      state.permissions = action.payload;
    },
    updateFormData(state, action: PayloadAction<Partial<CallState['formData']>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    setSequenceError(state, action: PayloadAction<string>) {
      state.sequenceState.lastError = action.payload;
    },
  },
});

export const {
  startSequence,
  updateSequenceProgress,
  endSequence,
  addCallLog,
  setPermissions,
  updateFormData,
  setSequenceError,
} = callSlice.actions;
export default callSlice.reducer;