import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Container } from '../../components/layout/Container';
import { colors } from '../../theme';

export const FamilyScreen: React.FC = () => {
  return (
    <Container>
      <View style={styles.center}>
        <Text style={styles.title}>Family</Text>
        <Text style={styles.subtitle}>Manage your family groups</Text>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    color: colors.gray[500],
    fontSize: 16,
  },
  title: {
    color: colors.gray[800],
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
