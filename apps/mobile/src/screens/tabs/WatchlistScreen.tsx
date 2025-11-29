import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Container } from '../../components/layout/Container';
import { ImportExportSection } from '../../components/watchlist/ImportExportSection';
import { colors } from '../../theme';

export const WatchlistScreen: React.FC = () => {
  const handleImportComplete = () => {
    // TODO: Refresh watchlist data when import completes
  };

  return (
    <Container scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Watchlist</Text>
        <Text style={styles.subtitle}>Your watchlist will appear here</Text>
      </View>

      <ImportExportSection onImportComplete={handleImportComplete} />
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  subtitle: {
    color: colors.gray[500],
    fontSize: 16,
    marginTop: 8,
  },
  title: {
    color: colors.gray[800],
    fontSize: 24,
    fontWeight: 'bold',
  },
});
