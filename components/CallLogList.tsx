import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { format } from 'date-fns';

interface CallLogItem {
  id: string;
  phoneNumber: string;
  status: string;
  timestamp: number;
  duration?: number;
  note?: string;
}

const CallLogList: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch call logs from Redux store
  const callLogs: CallLogItem[] = useSelector((state: RootState) => state.call.callHistory);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError(null);
    } catch (err) {
      setError('Failed to refresh call logs');
      Alert.alert('Error', 'Unable to refresh call logs. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'failed': return '#F44336';
      default: return '#FFC107';
    }
  };

  const renderCallLogItem = ({ item }: { item: CallLogItem }) => (
    <TouchableOpacity
      style={styles.logItem}
      onPress={() => Alert.alert('Call Log Details', `Phone: ${item.phoneNumber}\nStatus: ${item.status}`)}
    >
      <View style={styles.statusIndicatorWrapper}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
        <View style={styles.logContent}>
          <Text style={styles.logMessage} numberOfLines={1}>{item.phoneNumber}</Text>
          <Text style={styles.timestamp}>{format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading call logs...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={callLogs}
      renderItem={renderCallLogItem}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#0000ff']} tintColor="#0000ff" />
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No call logs available.</Text>}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: { padding: 16 },
  logItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  statusIndicatorWrapper: { flexDirection: 'row', alignItems: 'center' },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  logContent: { flex: 1 },
  logMessage: { fontSize: 16, color: '#1f2937' },
  timestamp: { fontSize: 12, color: '#6b7280' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#374151' },
});

export default CallLogList;
