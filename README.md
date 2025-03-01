# Sequential Caller

A React Native mobile application designed for personal use, enabling users to make sequential phone calls, send SMS messages, and manage call logs with contact integration. This project uses a bare React Native setup and is optimized for Android deployment with Visual Studio Code.

## Features

- **Sequential Calls**: Make multiple calls to a specified phone number with configurable delays.
- **SMS Sending**: Send SMS messages after completing call sequences.
- **Call Logging**: Track call history with status (success, failed, pending), timestamps, and optional notes.
- **Contact Integration**: Pick phone numbers from your device’s contact list.
- **Error Handling**: Robust error boundaries and logging for debugging.

## Prerequisites

- Node.js (v18 or later) with npm
- Java Development Kit (JDK) v23.0.1 (or v17)
- Android Studio with Android SDK (API 33 recommended)
- Visual Studio Code
- An Android device with USB debugging enabled (or an emulator)

## Project Structure
```
sequential-caller/
├── android/              # Android native code
├── components/           # React components (CallInput, CallLogList, etc.)
├── screens/              # Screen components (HomeScreen, CallLogScreen)
├── services/             # Service modules (CallService, SmsService)
├── store/                # Redux store and slices
├── utils/                # Utility functions (phoneUtils, dateUtils)
├── app.json              # Expo-like config (used for reference)
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

# Setup Instructions

## Install Dependencies
1. Navigate to the project directory:
    ```bash
    cd sequential-caller
    ```
2. Install dependencies:
    ```bash
    npm install
    ```

## Build and Run

### Debug Build:
1. Start Metro:
    ```bash
    npx react-native start
    ```
2. Build and run on an Android device/emulator:
    ```bash
    npx react-native run-android
    ```

### Release Build:
1. Generate a signing key:
    ```bash
    keytool -genkeypair -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
    ```
2. Move `my-release-key.jks` to `android/app/`.
3. Configure `android/gradle.properties`:
    ```properties
    MYAPP_RELEASE_STORE_FILE=my-release-key.jks
    MYAPP_RELEASE_KEY_ALIAS=my-alias
    MYAPP_RELEASE_STORE_PASSWORD=yourpassword
    MYAPP_RELEASE_KEY_PASSWORD=yourpassword
    ```
4. Update `android/app/build.gradle`:
    ```gradle
    signingConfigs {
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
        }
    }
    ```
5. Build the release APK:
    ```bash
    cd android
    ./gradlew assembleRelease
    ```
6. Install on your device:
    ```bash
    adb install app/build/outputs/apk/release/app-release.apk
    ```

# Usage

- **Home Screen**: Enter a phone number and number of calls, optionally add an SMS message, then start the sequence.
- **Call Logs**: View call history with statuses and timestamps.
- **Contacts**: Select a contact to autofill the phone number.

# Dependencies

- `react-native`: Core framework
- `react-redux`: State management
- `@react-navigation/native`: Navigation
- `react-native-contacts`: Contact access
- `react-native-sms`: SMS functionality
- `react-native-call-detection`: Call state tracking

# Notes

- This is a bare React Native project, not Expo-based, for maximum control over native features.
- Optimized for Android deployment with VS Code.

# License

For personal use only.
