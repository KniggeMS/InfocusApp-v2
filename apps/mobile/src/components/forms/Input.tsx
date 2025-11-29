import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  error?: string;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  testID?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  secureTextEntry = false,
  error,
  editable = true,
  autoCapitalize = 'sentences',
  testID,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : undefined]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        editable={editable}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={colors.gray[400]}
        testID={testID}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: colors.red[500],
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.gray[300],
    borderRadius: 6,
    borderWidth: 1,
    color: colors.black,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: colors.red[500],
  },
  label: {
    color: colors.gray[700],
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
});
