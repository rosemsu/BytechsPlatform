// Importing required modules and components
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const ResetPassword = ({ route, navigation }) => {
  // Get email passed through route params
  const email = route.params.email;

  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password validation rules state
  const [validation, setValidation] = useState({
    length: false,
    digit: false,
    capital: false,
    special: false,
    match: false,
  });

  // Validates password and updates the UI indicators
  const validatePassword = (pwd, confirmPwd) => {
    const rules = {
      length: pwd.length > 8,
      digit: /\d/.test(pwd),
      capital: /[A-Z]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
      match: pwd === confirmPwd,
    };
    setValidation(rules);
    return Object.values(rules).every(Boolean); // return true if all rules pass
  };

  // Renders a ✅ or ❌ indicator for each rule
  const getIndicator = (condition, label) => (
    <Text style={{ color: condition ? 'green' : 'red', marginBottom: 4 }}>
      {condition ? '✅' : '❌'} {label}
    </Text>
  );

  // Handles password reset flow
  const resetPassword = async () => {
    const isValid = validatePassword(password, confirmPassword);
    if (!isValid) {
      Alert.alert('Invalid', 'Please meet all password requirements.');
      return;
    }

    try {
      // Check if email exists in Firebase
      const signInMethods = await auth().fetchSignInMethodsForEmail(email);
      if (!signInMethods.length) {
        Alert.alert('Error', 'User does not exist.');
        return;
      }

      // Sign in to update password (required by Firebase)
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update password
      await user.updatePassword(password);

      Alert.alert('Success', 'Password reset successfully.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Reset Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a new password</Text>
      <Text style={styles.subtitle}>
        Set a new password to log in and access your account.
      </Text>

      {/* Password input with toggle visibility */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, borderWidth: 0 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            validatePassword(text, confirmPassword);
          }}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} />
        </TouchableOpacity>
      </View>

      {/* Confirm password input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          validatePassword(password, text);
        }}
      />

      {/* Real-time password rules feedback */}
      <View style={styles.validationContainer}>
        {getIndicator(validation.length, 'Password Length > 8')}
        {getIndicator(validation.digit, 'At least 1 digit')}
        {getIndicator(validation.capital, 'At least 1 capital letter')}
        {getIndicator(validation.special, 'At least 1 special character')}
        {getIndicator(validation.match, 'Password matches confirm password')}
      </View>

      {/* Save button */}
      <TouchableOpacity style={styles.button} onPress={resetPassword}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the password reset screen components
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, marginBottom: 20, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  validationContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5c4dd2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

// Export component
export default ResetPassword;
