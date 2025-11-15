import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AxiosError } from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container } from '../../components/layout/Container';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import { loginSchema, LoginFormData } from '../../lib/validation/auth';
import { useAuth } from '../../lib/context/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      Alert.alert(
        'Login Failed',
        axiosError.response?.data?.error || (error as Error).message || 'Invalid email or password',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="Enter your email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="email-input"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="Enter your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
              testID="password-input"
            />
          )}
        />

        <Button
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          testID="login-button"
        />

        <TouchableOpacity
          style={styles.registerLink}
          testID="register-link"
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            Don&apos;t have an account? <Text style={styles.registerTextBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  form: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
    marginTop: 40,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  registerTextBold: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 16,
  },
  title: {
    color: '#1f2937',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
