import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Palette } from '../types';
import {
  loadLibrary,
  saveLibrary,
  loadActivePalette,
  setActivePaletteId,
  isValidHex,
} from '../storage';

/**
 * SettingsScreen Component (Palette Library)
 * Lists saved palettes so the user can switch the active guideline,
 * and provides an editor for entering a name and nine hex codes.
 */
export default function SettingsScreen() {
  const [library, setLibrary] = useState<Palette[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [paletteName, setPaletteName] = useState('');
  const [colors, setColors] = useState<string[]>(Array(9).fill('#FFFFFF'));
  const [message, setMessage] = useState('');

  useEffect(() => {
    /** Loads the library and active palette into state when the screen opens. */
    const init = async () => {
      try {
        const active = await loadActivePalette();
        setLibrary(await loadLibrary());
        selectPalette(active);
      } catch (error) {
        console.error('Failed to load palettes', error);
      }
    };
    init();
  }, []);

  /**
   * Copies a palette into the editor fields and marks it active.
   * @param palette The palette chosen by the user
   */
  const selectPalette = (palette: Palette) => {
    setActiveId(palette.id);
    setPaletteName(palette.name);
    setColors([...palette.colors]);
    setMessage('');
    setActivePaletteId(palette.id);
  };

  /**
   * Updates one hex code in the editor, forcing a leading '#'.
   * @param index The index of the color in the grid (0-8)
   * @param value The text typed by the user
   */
  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value.startsWith('#') ? value : `#${value}`;
    setColors(newColors);
  };

  /**
   * Validates the editor, then saves it either over the active palette
   * or as a brand-new palette, and persists the library.
   * @param asNew True to create a new palette instead of overwriting
   */
  const savePalette = async (asNew: boolean) => {
    if (!paletteName.trim()) {
      setMessage('Please enter a brand name.');
      return;
    }
    const badIndex = colors.findIndex((c) => !isValidHex(c));
    if (badIndex !== -1) {
      setMessage(`Color ${badIndex + 1} is not a valid hex code.`);
      return;
    }
    const id = asNew || activeId === '' ? Date.now().toString() : activeId;
    const palette: Palette = { id, name: paletteName.trim(), colors };
    const updated = asNew
      ? [...library, palette]
      : library.map((p) => (p.id === id ? palette : p));
    try {
      await saveLibrary(updated);
      await setActivePaletteId(id);
      setLibrary(updated);
      setActiveId(id);
      setMessage(`Saved "${palette.name}" and set it as active.`);
    } catch (error) {
      console.error('Failed to save palette', error);
      setMessage('Failed to save palette.');
    }
  };

  /**
   * Removes the active palette from the library (at least one must remain).
   */
  const deletePalette = async () => {
    if (library.length <= 1) {
      setMessage('You must keep at least one palette.');
      return;
    }
    const updated = library.filter((p) => p.id !== activeId);
    await saveLibrary(updated);
    setLibrary(updated);
    selectPalette(updated[0]);
    setMessage('Palette deleted.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Saved Palettes</Text>
      <View style={styles.chipRow}>
        {library.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.chip, p.id === activeId && styles.chipActive]}
            onPress={() => selectPalette(p)}
          >
            <Text style={p.id === activeId ? styles.chipTextActive : styles.chipText}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.header}>Palette Editor</Text>
      <Text style={styles.label}>Brand Name</Text>
      <TextInput
        style={styles.input}
        value={paletteName}
        onChangeText={setPaletteName}
        placeholder="e.g. Acme Corp"
      />

      <Text style={styles.label}>Grid Colors (Hex Codes)</Text>
      <View style={styles.colorInputsContainer}>
        {colors.map((color, index) => (
          <View key={index} style={styles.colorInputWrapper}>
            <View style={[styles.colorPreview, { backgroundColor: isValidHex(color) ? color : '#FFF' }]} />
            <TextInput
              testID={`hex-${index}`}
              style={[styles.colorInput, !isValidHex(color) && styles.invalidInput]}
              value={color}
              onChangeText={(val) => handleColorChange(index, val)}
              placeholder="#000000"
              maxLength={7}
              autoCapitalize="characters"
            />
          </View>
        ))}
      </View>

      {message !== '' && <Text style={styles.message}>{message}</Text>}

      <TouchableOpacity style={styles.saveButton} onPress={() => savePalette(false)}>
        <Text style={styles.buttonText}>Save & Apply</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.saveButton, styles.newButton]} onPress={() => savePalette(true)}>
        <Text style={styles.buttonText}>Save as New Palette</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.saveButton, styles.deleteButton]} onPress={deletePalette}>
        <Text style={styles.buttonText}>Delete Palette</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: 'bold', marginVertical: 12, color: '#333' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#007AFF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: '#007AFF' },
  chipText: { color: '#007AFF' },
  chipTextActive: { color: '#FFF', fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
  },
  colorInputsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  colorInputWrapper: { width: '30%', marginBottom: 15 },
  colorPreview: { width: '100%', height: 40, borderRadius: 6, borderWidth: 1, borderColor: '#EEE', marginBottom: 6 },
  colorInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  invalidInput: { borderColor: '#FF3B30', borderWidth: 2 },
  message: { marginTop: 10, color: '#333', fontWeight: '600', textAlign: 'center' },
  saveButton: { marginTop: 14, backgroundColor: '#34C759', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  newButton: { backgroundColor: '#007AFF' },
  deleteButton: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
