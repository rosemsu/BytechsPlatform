// Importing required modules and components
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore'; // Reserved for the 4-digit code

const Verification = ({ navigation, route }) => {
  // Extract the email passed via navigation route
  const email = route.params?.email;

  useEffect(() => {
    // Optional: Add any side-effects like opening mail app or showing a toast here
  }, []);

  // This function checks if the email has been verified
  const handleContinue = async () => {
    const user = auth().currentUser;
    await user.reload(); // Refresh user data

    if (user.emailVerified) {
      Alert.alert('Success', 'Email verified!');
      navigation.navigate('Login'); // Proceed to login
    } else {
      Alert.alert('Not Verified', 'Please verify your email before continuing.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your email</Text>

      <Text style={styles.subtitle}>
        A verification link has been sent to {email}. Please check your inbox and click the link to verify your account.
      </Text>

      {/* Button to confirm that the user has verified their email */}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>I Verified My Email</Text>
      </TouchableOpacity>

      {/* Fallback option to return to login */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.resend}>Back to Login</Text>
      </TouchableOpacity>

      {/* ========= 4-digit verification code UI ========== */}

      {/*
      const [code, setCode] = useState(['', '', '', '']);
      const [timer, setTimer] = useState(300); // 5 minutes countdown

      // Verifies the 4-digit code with Firestore
      const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 4) {
          Alert.alert('Error', 'Enter the full 4-digit code.');
          return;
        }

        try {
          const doc = await firestore().collection('PasswordResetCodes').doc(email).get();
          if (!doc.exists || doc.data().code !== fullCode) {
            Alert.alert('Invalid Code', 'Incorrect or expired code.');
            return;
          }

          await firestore().collection('PasswordResetCodes').doc(email).delete();
          navigation.navigate('ResetPassword', { email });
        } catch (err) {
          Alert.alert('Error', err.message);
        }
      };

      // Handles individual code input changes
      const handleChange = (val, index) => {
        const newCode = [...code];
        newCode[index] = val;
        setCode(newCode);
      };

      <View style={styles.codeRow}>
        {code.map((char, i) => (
          <TextInput
            key={i}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="number-pad"
            value={char}
            onChangeText={(val) => handleChange(val, i)}
          />
        ))}
      </View>

      <Text style={styles.timer}>
        {`0${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
      </Text>

      <TouchableOpacity onPress={() => setTimer(300)}>
        <Text style={styles.resend}>Resend Code</Text>
      </TouchableOpacity>
      */}

    </View>
  );
};

// Styles for the verification screen components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#5c4dd2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  resend: {
    color: '#5c4dd2',
    textAlign: 'center',
    marginTop: 10
  },
  // starting here are the styles for the 4-digit verification
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
    width: 50,
  },
  timer: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10
  },
});

// Export component
export default Verification;
