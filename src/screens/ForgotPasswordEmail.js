// Importing required modules and components
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const ForgotPasswordEmail = ({ navigation }) => {
  const [email, setEmail] = useState('');

  // Generate random 4-digit code
  const generateCode = () =>
    Math.floor(1000 + Math.random() * 9000).toString();

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      // Look for user by email in Firestore
      const userSnapshot = await firestore()
        .collection('Users')
        .where('Email', '==', cleanEmail)
        .get();

      if (userSnapshot.empty) {
        Alert.alert('Error', 'No user found with this email.');
        return;
      }

      const code = generateCode();

      // Store the reset code
      await firestore()
        .collection('PasswordResetCodes')
        .doc(cleanEmail)
        .set({
          code,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert(
        'Code Sent',
        `A 4-digit code has been sent to ${cleanEmail} (simulated).`
      );

      // Navigate to verification screen
      navigation.navigate('Verification', { email: cleanEmail });
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Did you forget your password?</Text>
      <Text style={styles.subtitle}>
        Enter your email to verify your account.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={handleSendCode}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>

       {/* Back to Login Button */}
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.navigate('Login')}
    >
      <Text style={styles.backButtonText}>Back to Login</Text>
    </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b0b38',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5c4dd2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
  marginTop: 16,
  alignItems: 'center',
},
backButtonText: {
  color: '#5c4dd2',
  fontWeight: 'bold',
  fontSize: 14,
},

});

export default ForgotPasswordEmail;
