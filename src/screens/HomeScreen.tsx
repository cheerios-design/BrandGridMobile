import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Palette } from '../types';
import { loadActivePalette, getContrastColor } from '../storage';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const GRID_SIZE = Math.min(width * 0.9, 400);
const CELL_SIZE = GRID_SIZE / 3;

/**
 * HomeScreen Component
 * Displays the active brand palette as a 3x3 inspection grid.
 * Tapping a cell selects it and shows its details below the grid.
 */
export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [activePalette, setActivePalette] = useState<Palette | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Reload the palette every time the screen gains focus (e.g. returning from Settings)
  useFocusEffect(
    useCallback(() => {
      /** Fetches the active palette from storage and resets the selection. */
      const refresh = async () => {
        try {
          setActivePalette(await loadActivePalette());
          setSelectedIndex(null);
        } catch (error) {
          console.error('Failed to load active palette', error);
        }
      };
      refresh();
    }, [])
  );

  /**
   * Toggles selection of a grid cell; tapping the selected cell again clears it.
   * @param index The cell position (0-8)
   */
  const handleCellPress = (index: number) => {
    setSelectedIndex((current) => (current === index ? null : index));
  };

  const selectedColor =
    activePalette && selectedIndex !== null ? activePalette.colors[selectedIndex] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BrandGrid Mobile</Text>
      <Text style={styles.subtitle}>
        Active Guideline: {activePalette ? activePalette.name : 'Loading...'}
      </Text>

      <View style={styles.gridContainer}>
        {activePalette?.colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            testID={`cell-${index}`}
            onPress={() => handleCellPress(index)}
            style={[
              styles.gridCell,
              { backgroundColor: color },
              selectedIndex === index && styles.selectedCell,
            ]}
          >
            <Text style={[styles.colorText, { color: getContrastColor(color) }]}>
              {color.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inspector}>
        {selectedColor
          ? `Cell ${selectedIndex! + 1}: ${selectedColor.toUpperCase()} (text: ${
              getContrastColor(selectedColor) === '#FFFFFF' ? 'white' : 'black'
            })`
          : 'Tap a cell to inspect it'}
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.buttonText}>Open Palette Library</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  gridContainer: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridCell: { width: CELL_SIZE, height: CELL_SIZE, justifyContent: 'center', alignItems: 'center' },
  selectedCell: { borderWidth: 4, borderColor: '#007AFF' },
  colorText: { fontSize: 12, fontWeight: 'bold' },
  inspector: { marginTop: 20, fontSize: 15, color: '#333' },
  button: { marginTop: 30, backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
