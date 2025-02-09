// components/ContactsList.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Text } from 'react-native';
import Contacts from 'react-native-contacts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { updateFormData } from '../store/callSlice';
import { sanitizePhoneNumber } from '../utils/phoneUtils';

const ContactsList = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { accessContacts } = useSelector((state: RootState) => state.call.permissions);

  useEffect(() => {
    if (accessContacts) {
      Contacts.getAll()
        .then(allContacts => {
          setContacts(allContacts.filter(c => c.phoneNumbers?.length > 0));
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [accessContacts]);

  const handleContactSelect = (phoneNumber: string) => {
    const cleanedNumber = sanitizePhoneNumber(phoneNumber);
    dispatch(updateFormData({ phoneNumber: cleanedNumber }));
  };

  const filteredContacts = contacts.filter(contact =>
    `${contact.givenName} ${contact.familyName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search contacts..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.recordID}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContactSelect(item.phoneNumbers[0].number)}
            >
              <Text style={styles.contactName}>
                {item.givenName} {item.familyName}
              </Text>
              {item.phoneNumbers?.length > 0 && (
                <Text style={styles.phoneNumber}>
                  {item.phoneNumbers[0].number}
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No contacts found</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16
  },
  contactItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500'
  },
  phoneNumber: {
    color: '#666',
    marginTop: 4
  }
});

export default ContactsList;