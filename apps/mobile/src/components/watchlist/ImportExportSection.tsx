import React, { useState } from 'react';
import { StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Select,
  CheckIcon,
  Modal,
  FormControl,
  WarningOutlineIcon,
} from 'native-base';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { watchlistApi } from '../../lib/api/watchlist';
import type {
  NormalizedPreviewItem,
  BulkImportRequest,
  DuplicateResolution,
} from '@infocus/shared';
import { colors } from '../../theme';

interface ImportExportSectionProps {
  onImportComplete?: () => void;
}

export const ImportExportSection: React.FC<ImportExportSectionProps> = ({ onImportComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [previewItems, setPreviewItems] = useState<NormalizedPreviewItem[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedMatchIndices, setSelectedMatchIndices] = useState<Record<number, number>>({});
  const [duplicateStrategies, setDuplicateStrategies] = useState<Record<number, string>>({});
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/json', 'text/plain'],
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset.uri) {
          Alert.alert('Error', 'Failed to read file');
          return;
        }

        setIsImporting(true);
        const fileContent = await FileSystem.readAsStringAsync(asset.uri);

        const items = await watchlistApi.previewImport(fileContent);
        setPreviewItems(items);
        setShowPreviewModal(true);
      }
    } catch (error) {
      console.error('File selection error:', error);
      Alert.alert('Error', 'Failed to select or read file');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    try {
      setIsConfirmingImport(true);

      const resolutions: DuplicateResolution[] = [];
      previewItems.forEach((item, index) => {
        if (item.hasExistingEntry) {
          const strategy = (duplicateStrategies[index] ||
            'skip') as DuplicateResolution['strategy'];
          resolutions.push({
            itemIndex: index,
            strategy,
          });
        }

        if (selectedMatchIndices[index] !== undefined) {
          const updatedItem = { ...item };
          updatedItem.selectedMatchIndex = selectedMatchIndices[index];
          previewItems[index] = updatedItem;
        }
      });

      const importRequest: BulkImportRequest = {
        items: previewItems.map((item) => ({
          ...item,
          selectedMatchIndex: selectedMatchIndices[previewItems.indexOf(item)],
        })),
        resolutions,
        skipUnmatched: false,
        defaultDuplicateStrategy: 'skip',
      };

      const result = await watchlistApi.confirmImport(importRequest);

      setShowPreviewModal(false);
      setPreviewItems([]);
      setSelectedMatchIndices({});
      setDuplicateStrategies({});

      Alert.alert(
        'Import Complete',
        `Imported: ${result.imported}, Skipped: ${result.skipped}, Failed: ${result.failed}`,
      );

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Import confirm error:', error);
      Alert.alert('Error', 'Failed to confirm import');
    } finally {
      setIsConfirmingImport(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const blob = await watchlistApi.exportWatchlistAsFile(exportFormat);
      const fileExt = exportFormat === 'json' ? 'json' : 'csv';
      const fileName = `watchlist-${new Date().toISOString().split('T')[0]}.${fileExt}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Convert blob to base64 string using Promise-based approach
      const blobText = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });

      const base64 = blobText.split(',')[1];
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: exportFormat === 'json' ? 'application/json' : 'text/csv',
          dialogTitle: 'Export Watchlist',
          UTI: exportFormat === 'json' ? 'public.json' : 'public.csv',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export watchlist');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <VStack space={4} style={styles.section}>
      <Box style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Import/Export</Text>
      </Box>

      <HStack space={2}>
        <Button
          isDisabled={isImporting}
          flex={1}
          colorScheme="blue"
          onPress={handleSelectFile}
          _text={{ fontSize: 'sm' }}
        >
          {isImporting ? <ActivityIndicator /> : 'Import Watchlist'}
        </Button>
      </HStack>

      <Box style={styles.exportContainer}>
        <FormControl>
          <FormControl.Label _text={{ fontSize: 'sm', fontWeight: 'bold' }}>
            Export Format
          </FormControl.Label>
          <Select
            selectedValue={exportFormat}
            minWidth="200"
            accessibilityLabel="Choose export format"
            placeholder="Choose export format"
            _selectedItem={{
              bg: 'teal:600',
              endIcon: <CheckIcon size={4} />,
            }}
            mt={1}
            onValueChange={(itemValue) => setExportFormat(itemValue as 'json' | 'csv')}
          >
            <Select.Item label="JSON" value="json" />
            <Select.Item label="CSV" value="csv" />
          </Select>
        </FormControl>

        <Button
          isDisabled={isExporting}
          mt={3}
          colorScheme="green"
          onPress={handleExport}
          _text={{ fontSize: 'sm' }}
        >
          {isExporting ? <ActivityIndicator /> : 'Export Watchlist'}
        </Button>
      </Box>

      <PreviewModal
        visible={showPreviewModal}
        items={previewItems}
        selectedMatchIndices={selectedMatchIndices}
        duplicateStrategies={duplicateStrategies}
        isConfirming={isConfirmingImport}
        onMatchSelect={(itemIndex, matchIndex) => {
          setSelectedMatchIndices((prev) => ({
            ...prev,
            [itemIndex]: matchIndex,
          }));
        }}
        onDuplicateStrategyChange={(itemIndex, strategy) => {
          setDuplicateStrategies((prev) => ({
            ...prev,
            [itemIndex]: strategy,
          }));
        }}
        onConfirm={handleConfirmImport}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewItems([]);
          setSelectedMatchIndices({});
          setDuplicateStrategies({});
        }}
      />
    </VStack>
  );
};

interface PreviewModalProps {
  visible: boolean;
  items: NormalizedPreviewItem[];
  selectedMatchIndices: Record<number, number>;
  duplicateStrategies: Record<number, string>;
  isConfirming: boolean;
  onMatchSelect: (itemIndex: number, matchIndex: number) => void;
  onDuplicateStrategyChange: (itemIndex: number, strategy: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  visible,
  items,
  selectedMatchIndices,
  duplicateStrategies,
  isConfirming,
  onMatchSelect,
  onDuplicateStrategyChange,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal isOpen={visible} onClose={onClose} size="full">
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>Import Preview ({items.length} items)</Modal.Header>
        <Modal.Body>
          <ScrollView style={styles.previewList}>
            {items.map((item, itemIndex) => (
              <PreviewItem
                key={itemIndex}
                item={item}
                itemIndex={itemIndex}
                selectedMatchIndex={selectedMatchIndices[itemIndex]}
                duplicateStrategy={duplicateStrategies[itemIndex] || 'skip'}
                onMatchSelect={onMatchSelect}
                onDuplicateStrategyChange={onDuplicateStrategyChange}
              />
            ))}
          </ScrollView>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button
              variant="ghost"
              colorScheme="blueGray"
              onPress={onClose}
              isDisabled={isConfirming}
            >
              Cancel
            </Button>
            <Button isDisabled={isConfirming} onPress={onConfirm} colorScheme="green">
              {isConfirming ? <ActivityIndicator color="white" /> : 'Confirm Import'}
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

interface PreviewItemProps {
  item: NormalizedPreviewItem;
  itemIndex: number;
  selectedMatchIndex?: number;
  duplicateStrategy: string;
  onMatchSelect: (itemIndex: number, matchIndex: number) => void;
  onDuplicateStrategyChange: (itemIndex: number, strategy: string) => void;
}

const PreviewItem: React.FC<PreviewItemProps> = ({
  item,
  itemIndex,
  selectedMatchIndex,
  duplicateStrategy,
  onMatchSelect,
  onDuplicateStrategyChange,
}) => {
  const [showMatches, setShowMatches] = useState(false);
  const [showDuplicateOptions, setShowDuplicateOptions] = useState(item.hasExistingEntry);

  const selectedMatch = item.matchCandidates[selectedMatchIndex ?? 0];

  return (
    <Box style={styles.previewItem}>
      <HStack justifyContent="space-between" alignItems="flex-start" mb={2}>
        <VStack flex={1}>
          <Text style={styles.itemTitle}>{item.originalTitle}</Text>
          {item.originalYear && <Text style={styles.itemYear}>({item.originalYear})</Text>}
        </VStack>
        {item.error && <WarningOutlineIcon size="lg" color="red.500" ml={2} />}
      </HStack>

      {item.matchCandidates.length > 0 && (
        <Box mb={3}>
          <TouchableOpacity onPress={() => setShowMatches(!showMatches)}>
            <Text style={styles.matchLabel}>
              TMDB Match: {selectedMatch?.title} ({selectedMatch?.year}) -{' '}
              {Math.round((selectedMatch?.confidence || 0) * 100)}%
            </Text>
          </TouchableOpacity>

          {showMatches && (
            <VStack mt={2} space={1}>
              {item.matchCandidates.map((candidate, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    onMatchSelect(itemIndex, idx);
                    setShowMatches(false);
                  }}
                  style={[
                    styles.matchOption,
                    selectedMatchIndex === idx && styles.matchOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.matchOptionText,
                      selectedMatchIndex === idx && styles.matchOptionTextSelected,
                    ]}
                  >
                    {candidate.title} ({candidate.year}) - {Math.round(candidate.confidence * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </VStack>
          )}
        </Box>
      )}

      {item.hasExistingEntry && (
        <Box style={styles.duplicateWarning} mb={2}>
          <HStack alignItems="center" space={2}>
            <WarningOutlineIcon color="orange.500" />
            <VStack flex={1}>
              <Text style={styles.duplicateLabel}>Duplicate Entry Found</Text>
              <TouchableOpacity onPress={() => setShowDuplicateOptions(!showDuplicateOptions)}>
                <Text style={styles.duplicateValue}>Strategy: {duplicateStrategy}</Text>
              </TouchableOpacity>
            </VStack>
          </HStack>

          {showDuplicateOptions && (
            <VStack mt={2} space={1}>
              <DuplicateStrategyOption
                label="Skip"
                value="skip"
                selected={duplicateStrategy === 'skip'}
                onPress={() => {
                  onDuplicateStrategyChange(itemIndex, 'skip');
                  setShowDuplicateOptions(false);
                }}
              />
              <DuplicateStrategyOption
                label="Overwrite"
                value="overwrite"
                selected={duplicateStrategy === 'overwrite'}
                onPress={() => {
                  onDuplicateStrategyChange(itemIndex, 'overwrite');
                  setShowDuplicateOptions(false);
                }}
              />
              <DuplicateStrategyOption
                label="Merge"
                value="merge"
                selected={duplicateStrategy === 'merge'}
                onPress={() => {
                  onDuplicateStrategyChange(itemIndex, 'merge');
                  setShowDuplicateOptions(false);
                }}
              />
            </VStack>
          )}
        </Box>
      )}

      {item.error && (
        <Box style={styles.errorBox}>
          <Text style={styles.errorText}>{item.error}</Text>
        </Box>
      )}
    </Box>
  );
};

interface DuplicateStrategyOptionProps {
  label: string;
  value: string;
  selected: boolean;
  onPress: () => void;
}

const DuplicateStrategyOption: React.FC<DuplicateStrategyOptionProps> = ({
  label,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.strategyOption, selected && styles.strategyOptionSelected]}
  >
    <Text style={[styles.strategyLabel, selected && styles.strategyLabelSelected]}>
      {selected ? '✓ ' : '  '} {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  duplicateLabel: {
    color: colors.amber[800],
    fontSize: 12,
    fontWeight: '600',
  },
  duplicateValue: {
    color: colors.amber[900],
    fontSize: 11,
    marginTop: 2,
  },
  duplicateWarning: {
    backgroundColor: colors.amber[100],
    borderColor: colors.amber[300],
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
  },
  errorBox: {
    backgroundColor: colors.red[100],
    borderColor: colors.red[200],
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
    padding: 8,
  },
  errorText: {
    color: colors.red[900],
    fontSize: 11,
  },
  exportContainer: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  itemTitle: {
    color: colors.gray[800],
    fontSize: 14,
    fontWeight: '600',
  },
  itemYear: {
    color: colors.gray[500],
    fontSize: 12,
    marginTop: 4,
  },
  matchLabel: {
    color: colors.blue[600],
    fontSize: 12,
    fontWeight: '500',
  },
  matchOption: {
    backgroundColor: colors.white,
    borderColor: colors.gray[300],
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  matchOptionSelected: {
    backgroundColor: colors.blue[100],
    borderColor: colors.blue[600],
  },
  matchOptionText: {
    color: colors.gray[500],
    fontSize: 12,
  },
  matchOptionTextSelected: {
    color: colors.blue[800],
    fontWeight: '600',
  },
  previewItem: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  previewList: {
    maxHeight: '80%',
  },
  section: {
    borderTopColor: colors.gray[200],
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.gray[800],
    fontSize: 18,
    fontWeight: 'bold',
  },
  strategyLabel: {
    color: colors.gray[500],
    fontSize: 12,
  },
  strategyLabelSelected: {
    color: colors.green[700],
    fontWeight: '600',
  },
  strategyOption: {
    backgroundColor: colors.white,
    borderColor: colors.gray[300],
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  strategyOptionSelected: {
    backgroundColor: colors.green[100],
    borderColor: colors.green[500],
  },
});
