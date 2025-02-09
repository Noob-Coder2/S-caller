import { Platform, Linking } from 'react-native';
import SendSMS from 'react-native-sms';

export const sendSms = (phoneNumber: string, message: string) => {
  if (Platform.OS === 'android') {
    // Android: Uses react-native-sms
    SendSMS.send(
      {
        body: message,
        recipients: [phoneNumber],
        allowAndroidSendWithoutReadPermission: true,
      },
      (completed, cancelled, error) => {
        if (completed) {
          console.log('SMS sent successfully');
        } else if (cancelled) {
          console.log('SMS sending cancelled');
        } else if (error) {
          console.error('Error sending SMS:', error);
        }
      }
    );
  } else {
    // iOS: Open Messages app
    const smsUrl = `sms:${phoneNumber}&body=${encodeURIComponent(message)}`;
    Linking.openURL(smsUrl)
      .then(() => console.log('Opened SMS app on iOS'))
      .catch((error) => console.error('Error opening SMS app:', error));
  }
};
