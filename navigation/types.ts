// navigation/types.ts
import { NavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
    Home: undefined;
    CallLog: undefined;
    Contacts: undefined;
  };
  
  export type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;
  export type CallLogScreenNavigationProp = NavigationProp<RootStackParamList, 'CallLog'>;
  