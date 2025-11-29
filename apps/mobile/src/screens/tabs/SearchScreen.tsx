import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Container } from '../../components/layout/Container';
import { colors } from '../../theme';

export const SearchScreen: React.FC = () => {
  return (
    <Container>
      <View style={styles.center}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Search for movies and TV shows</Text>
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
