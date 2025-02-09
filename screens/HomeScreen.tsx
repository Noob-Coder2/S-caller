import React from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { makeCall } from '../services/CallService';
import { RootState } from '../store/store';
import { updateFormData, setSequenceError } from '../store/callSlice';
import CallLogList from '../components/CallLogList';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { phoneNumber, lastError } = useSelector((state: RootState) => ({
    phoneNumber: state.call.formData.phoneNumber,
    lastError: state.call.sequenceState.lastError,
  }));
  const [loading, setLoading] = React.useState(false);

  const handleCall = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number.');
      return;
    }
    setLoading(true);
    try {
      await makeCall(phoneNumber);
      dispatch(updateFormData({ phoneNumber: '' })); // Clear phone number after call
      if (lastError) {
        Alert.alert('Error', lastError);
      }
    } catch (error) {
      dispatch(setSequenceError('Failed to initiate call.'));
      Alert.alert('Error', 'Failed to initiate call.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        value={phoneNumber}
        onChangeText={(text) => dispatch(updateFormData({ phoneNumber: text }))}
        keyboardType="phone-pad"
      />
      <Button title="Make Call" onPress={handleCall} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <CallLogList /> {/* Integrating CallLogList component */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default HomeScreen;
