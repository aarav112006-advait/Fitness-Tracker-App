import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';
import { AuthContext } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, authError } = useContext(AuthContext);

  const handleRegister = async () => {
    if (email && password && displayName) {
      await register(email, password, displayName);
    }
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.brandBox}>
        <Text style={styles.brandLogo}>CREATE PROFILE</Text>
        <Text style={styles.brandSub}>Join thousands of active athletes</Text>
      </View>

      {authError && <Text style={styles.errorText}>{authError}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Full Name (e.g. Aarav Patel)"
        placeholderTextColor={colors.textMuted}
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="Athlete Email"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Choose Password"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={globalStyles.buttonPrimary} onPress={handleRegister} disabled={loading}>
        <Text style={globalStyles.buttonPrimaryText}>{loading ? 'Creating Account...' : 'Get Started'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchLink} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.switchText}>Already have an account? <Text style={{ color: colors.primary }}>Sign In</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  brandSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    color: colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    fontSize: 15,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  switchLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
