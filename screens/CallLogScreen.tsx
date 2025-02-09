import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { makeCall } from '../services/CallService';
import { sendSms } from '../services/SmsService';
import { fetchCallLogs } from '../services/BackgroundService';

const CallLogScreen = () => {
  const dispatch = useDispatch();
  const callLogs = useSelector((state: RootState) => state.call.callHistory || []);
  const isLoading = callLogs.length === 0;

  useEffect(() => {
    dispatch(fetchCallLogs()); // Automatically fetch call logs in the background
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call Log</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={callLogs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text>{item.phoneNumber} - {item.status}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => makeCall(item.phoneNumber)}>
                  <Text style={styles.callButton}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => sendSms(item.phoneNumber, 'Hello!')}>
                  <Text style={styles.smsButton}>SMS</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      {callLogs.length === 0 && !isLoading && (
        <Text style={styles.emptyMessage}>No call logs available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  callButton: {
    color: 'blue',
    fontWeight: 'bold',
  },
  smsButton: {
    color: 'green',
    fontWeight: 'bold',
  },
});

export default CallLogScreen;
