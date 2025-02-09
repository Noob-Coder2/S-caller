import React, { useCallback, useEffect,useState } from 'react';
import { View, TextInput, Button, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { makeSequentialCalls } from '../services/CallService';
import { RootState } from '../store/store';
import { updateFormData } from '../store/callSlice';
import ErrorBoundary from '../components/ErrorBoundary';
import { validatePhoneNumber, validateNumberOfCalls } from '../utils/validators';
import { handleError } from '../utils/errorHandler';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { sendSms } from '@/services/SmsService';
import { RootStackParamList } from '../navigation/types';

const CallInput = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { phoneNumber, numCalls, message } = useSelector(
    (state: RootState) => state.call.formData
  );
  const { isRunning, currentIndex } = useSelector(
    (state: RootState) => state.call.sequenceState
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleStartSequence = async () => {
    setValidationError(null); // Reset validation error
    if (!validateInput()) return; // Validate input before proceeding

    try {
      await makeSequentialCalls(phoneNumber, parseInt(numCalls, 10));
      if (message) {
        // Implement SMS sending logic here (make sure to implement it)
        await sendSms(phoneNumber, message); // Assuming this function exists
      }
    } catch (error) {
      console.error('Sequence failed:', error);
    }
  };

  const validateInput = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setValidationError('Invalid phone number');
      return false;
    }
    if (!validateNumberOfCalls(numCalls)) {
      setValidationError('Number of calls must be between 1 and 10');
      return false;
    }
    return true;
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Button
          title="Pick from Contacts"
          onPress={() => navigation.navigate('Contacts')}
          color="#4CAF50"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={(text) =>
            dispatch(updateFormData({ phoneNumber: text }))
          }
          keyboardType="phone-pad"
        />
        {validationError && !validatePhoneNumber(phoneNumber) && (
          <Text style={styles.errorText}>{validationError}</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Number of Calls"
          value={numCalls}
          onChangeText={(text) =>
            dispatch(updateFormData({ numCalls: text }))
          }
          keyboardType="numeric"
        />
        {validationError && !validateNumberOfCalls(numCalls) && (
          <Text style={styles.errorText}>{validationError}</Text>
        )}
        <Button
          title={
            isRunning
              ? `Calling ${currentIndex + 1}/${numCalls}`
              : 'Start Sequence'
          }
          onPress={handleStartSequence}
          disabled={isRunning}
        />
        {isRunning && <ActivityIndicator size="small" color="#0000ff" />}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default CallInput;
