import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
  Platform,
  Modal,
  TextInput
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { makeCall } from '../services/CallService';
import { sendSms } from '../services/SmsService';
import { formatTimestamp, formatDuration } from '../utils/dateUtils';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getErrorLogs } from '../utils/errorHandler';
import { Menu, Filter, Share as ShareIcon, Calendar, Clock, Phone, MessageSquare, Tag, Trash2 } from 'lucide-react';
import * as FileSystem from 'expo-file-system';

interface CallLogFilters {
  status: 'all' | 'success' | 'failed' | 'pending';
  type: 'all' | 'call' | 'sms';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

const CallLogScreen = () => {
  const dispatch = useDispatch();
  const callLogs = useSelector((state: RootState) => state.call.callHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<CallLogFilters>({
    status: 'all',
    type: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCallLogs();
  }, []);

  const loadCallLogs = async () => {
    setIsLoading(true);
    try {
      // In a real app, you might fetch logs from an API or local storage
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      setIsLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load call logs');
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCallLogs();
    setRefreshing(false);
  }, []);

  const handleExportLogs = async () => {
    try {
      const exportData = callLogs.map(log => ({
        ...log,
        timestamp: formatTimestamp(log.timestamp),
        duration: log.duration ? formatDuration(log.duration) : 'N/A',
        phoneNumber: formatPhoneNumber(log.phoneNumber),
        note: log.note || ''
      }));

      const csvContent = [
        'Date,Phone Number,Type,Status,Duration,Notes',
        ...exportData.map(log => 
          `${log.timestamp},${log.phoneNumber},${log.type},${log.status},${log.duration},${log.note || ''}`
        )
      ].join('\n');

      const path = `${FileSystem.documentDirectory}call_logs_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(path, csvContent);

      await Share.share({
        url: Platform.OS === 'ios' ? path : `file://${path}`,
        message: 'Call Logs Export'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export call logs');
    }
  };

  const handleDeleteLog = (logId: string) => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this log?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Dispatch delete action
            dispatch({ type: 'DELETE_CALL_LOG', payload: logId });
          }
        }
      ]
    );
  };

  const handleAddNote = (logId: string) => {
    setSelectedLog(callLogs.find(log => log.id === logId));
    setNoteText(selectedLog?.note || '');
    setShowNoteModal(true);
  };

  const saveNote = () => {
    if (selectedLog) {
      dispatch({
        type: 'UPDATE_CALL_LOG',
        payload: {
          id: selectedLog.id,
          note: noteText
        }
      });
      setShowNoteModal(false);
      setSelectedLog(null);
      setNoteText('');
    }
  };

  const filterLogs = useCallback(() => {
    let filtered = [...callLogs];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(log => log.type === filters.type);
    }

    // Apply date filter
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(log => new Date(log.timestamp) > weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(log => new Date(log.timestamp) > monthAgo);
        break;
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.phoneNumber.includes(searchQuery) ||
        (log.note && log.note.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [callLogs, filters, searchQuery]);

  const renderLogItem = ({ item }: { item: any }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <Text style={styles.phoneNumber}>{formatPhoneNumber(item.phoneNumber)}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.logDetails}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#666" />
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        {item.duration && (
          <View style={styles.detailRow}>
            <Calendar size={16} color="#666" />
            <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
          </View>
        )}
      </View>

      {item.note && (
        <Text style={styles.note} numberOfLines={2}>{item.note}</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => makeCall(item.phoneNumber)}
        >
          <Phone size={20} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => sendSms(item.phoneNumber, '')}
        >
          <MessageSquare size={20} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleAddNote(item.id)}
        >
          <Tag size={20} color="#FF9800" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteLog(item.id)}
        >
          <Trash2 size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'pending': return '#FFC107';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search logs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filterLogs()}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No call logs found</Text>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <TouchableOpacity
        style={styles.exportButton}
        onPress={handleExportLogs}
      >
        <ShareIcon size={24} color="#fff" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Logs</Text>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {['all', 'success', 'failed', 'pending'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      filters.status === status && styles.filterOptionSelected
                    ]}
                    onPress={() => setFilters({ ...filters, status: status as any })}
                  >
                    <Text style={styles.filterOptionText}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Type</Text>
              <View style={styles.filterOptions}>
                {['all', 'call', 'sms'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      filters.type === type && styles.filterOptionSelected
                    ]}
                    onPress={() => setFilters({ ...filters, type: type as any })}
                  >
                    <Text style={styles.filterOptionText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.filterOptions}>
                {['all', 'today', 'week', 'month'].map(range => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.filterOption,
                      filters.dateRange === range && styles.filterOptionSelected
                    ]}
                    onPress={() => setFilters({ ...filters, dateRange: range as any })}
                  >
                    <Text style={styles.filterOptionText}>{range}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNoteModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Note</Text>
            <TextInput
              style={styles.noteInput}
              multiline
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Enter note..."
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveNote}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  logDetails: {
    marginBottom: 8  },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    timestamp: {
      marginLeft: 8,
      fontSize: 14,
      color: '#666',
    },
    duration: {
      marginLeft: 8,
      fontSize: 14,
      color: '#666',
    },
    note: {
      marginTop: 8,
      fontSize: 14,
      color: '#333',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    actionButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: '#f5f5f5',
    },
    separator: {
      height: 1,
      backgroundColor: '#e0e0e0',
    },
    exportButton: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#888',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 8,
      width: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    filterSection: {
      marginBottom: 16,
    },
    filterLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    filterOption: {
      padding: 8,
      marginRight: 8,
      marginBottom: 8,
      borderRadius: 4,
      backgroundColor: '#f0f0f0',
    },
    filterOptionSelected: {
      backgroundColor: '#4CAF50',
    },
    filterOptionText: {
      fontSize: 14,
      color: '#333',
    },
    closeButton: {
      marginTop: 16,
      paddingVertical: 12,
      backgroundColor: '#4CAF50',
      borderRadius: 4,
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
    noteInput: {
      height: 100,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
      marginBottom: 16,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 4,
      width: '48%',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#f44336',
    },
    saveButton: {
      backgroundColor: '#4CAF50',
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 16,
    },
  });
  
  export default CallLogScreen;
  