import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>InFocus</Text>
      <ActivityIndicator size="large" color={colors.blue[500]} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    flex: 1,
    justifyContent: 'center',
  },
  loader: {
    marginTop: 16,
  },
  title: {
    color: colors.gray[800],
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});
