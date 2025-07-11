// src/screens/ResetPassword.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import authService from '../services/authService'; // Adjust path as needed
import {
  passwordRulesConfig,
  validatePasswordStructure,
  doPasswordsMatch,
  areAllPasswordRequirementsMet,
} from '../utils/validators'; // Adjust path as needed

const ResetPasswordScreen = ({ route, navigation }) => {
  // Get email passed through route params (ensure it's actually passed)
  const emailFromParams = route.params?.email; // Make sure 'email' is passed

  const [email, setEmail] = useState(''); // Could also keep it just from params
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    structure: {
      length: false,
      digit: false,
      capital: false,
      special: false,
    },
    match: false,
  });

  useEffect(() => {
    if (emailFromParams) {
      setEmail(emailFromParams);
    } else {
      // Handle case where email is not passed, e.g., show an error or navigate back
      Alert.alert("Error", "Email address not provided for password reset.");
      // navigation.goBack(); // Example action
    }
  }, [emailFromParams]);


  const handleValidation = (currentPassword, currentConfirmPassword) => {
    const structureStatus = validatePasswordStructure(currentPassword);
    const matchStatus = doPasswordsMatch(currentPassword, currentConfirmPassword);

    setPasswordValidation({
      structure: structureStatus,
      match: matchStatus,
    });
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    handleValidation(text, confirmPassword);
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    handleValidation(password, text);
  };

  const getIndicator = (condition, label) => (
    <Text style={[styles.validationText, { color: condition ? 'green' : 'red' }]}>
      {condition ? '✅' : '❌'} {label}
    </Text>
  );

  const handleResetPassword = async () => {
    if (!email) {
        Alert.alert('Error', 'Email is required to reset password.');
        return;
    }

    const allRequirementsMet = areAllPasswordRequirementsMet(
      passwordValidation.structure,
      passwordValidation.match
    );

    if (!allRequirementsMet) {
      Alert.alert('Invalid Password', 'Please ensure your new password meets all requirements and matches the confirmation.');
      return;
    }

    setIsLoading(true);
    try {
      const successMessage = await authService.setNewPasswordBySpecificFlow(email, password);
      Alert.alert('Success', successMessage);
      navigation.navigate('Login'); // Navigate to Login or a confirmation screen
    } catch (error) {
      Alert.alert('Password Reset Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a New Password</Text>
      <Text style={styles.subtitle}>
        Create a new password for your account associated with {email || "your email"}.
      </Text>

      {/* Password input */}
      <View style={styles.inputContainerWithIcon}>
        <TextInput
          style={styles.inputInContainer}
          placeholder="New Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={handlePasswordChange}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconTouchable}>
          <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Confirm password input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry // Always secure for confirm
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        autoCapitalize="none"
      />

      {/* Real-time password rules feedback */}
      <View style={styles.validationContainer}>
        {Object.entries(passwordRulesConfig).map(([key, config]) => (
          getIndicator(passwordValidation.structure[key] || false, config.label)
        ))}
        {getIndicator(passwordValidation.match, 'Passwords match')}
      </View>

      {/* Save button */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save New Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f7f7f7', // Light background
  },
  title: {
    fontSize: 26, // Slightly larger
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 15, // Slightly larger
    marginBottom: 25, // More space
    color: '#555', // Softer color
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15, // Consistent margin
    fontSize: 16,
    color: '#333',
  },
  inputContainerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  inputInContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  iconTouchable: {
    padding: 10, // Easier to tap
  },
  validationContainer: {
    marginTop: 5, // Reduced top margin
    marginBottom: 20,
  },
  validationText: {
    fontSize: 13, // Slightly smaller for conciseness
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#5c4dd2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // Center ActivityIndicator
    minHeight: 50, // Ensure consistent height
  },
  buttonDisabled: {
    backgroundColor: '#a59cdb', // Lighter when disabled
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ResetPasswordScreen;
