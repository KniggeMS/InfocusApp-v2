import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

interface InputProps {
  _value?: string;
  _onChangeText?: (text: string) => void;
  _placeholder?: string;
  _label?: string;
}

export const Input: React.FC<InputProps> = () => {
  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Enter text" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000000',
  },
});