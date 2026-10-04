import AsyncStorage from '@react-native-async-storage/async-storage';
import { Palette } from './types';

// Keys used to store data on the device
const LIBRARY_KEY = '@palette_library';
const ACTIVE_KEY = '@active_palette_id';

/** Palette shown the first time the app runs, before the user saves anything. */
export const DEFAULT_PALETTE: Palette = {
  id: 'default',
  name: 'Default Brand',
  colors: ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5', '#F5FF33', '#000000', '#888888', '#FFFFFF'],
};

/**
 * Loads every saved palette from AsyncStorage.
 * Returns a library containing only the default palette if nothing is saved yet.
 */
export async function loadLibrary(): Promise<Palette[]> {
  const json = await AsyncStorage.getItem(LIBRARY_KEY);
  return json ? (JSON.parse(json) as Palette[]) : [DEFAULT_PALETTE];
}

/**
 * Writes the full palette library to AsyncStorage so it survives app restarts.
 * @param library The list of palettes to persist
 */
export async function saveLibrary(library: Palette[]): Promise<void> {
  await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
}

/**
 * Returns the palette the user marked as active, falling back to the first one.
 */
export async function loadActivePalette(): Promise<Palette> {
  const library = await loadLibrary();
  const activeId = await AsyncStorage.getItem(ACTIVE_KEY);
  return library.find((p) => p.id === activeId) ?? library[0] ?? DEFAULT_PALETTE;
}

/**
 * Remembers which palette is active by storing its id.
 * @param id The id of the palette to activate
 */
export async function setActivePaletteId(id: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_KEY, id);
}

/**
 * Checks whether a string is a valid 3- or 6-digit hex color such as #FFF or #1A2B3C.
 * @param hex The string to validate
 */
export function isValidHex(hex: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}

/**
 * Picks black or white text so a label stays readable on the given background.
 * Uses the ITU-R BT.709 luminance formula.
 * @param hexColor The background hex color
 */
export function getContrastColor(hexColor: string): string {
  if (!isValidHex(hexColor)) return '#000000';
  let c = hexColor.substring(1);
  // Expand shorthand like "F0A" into "FF00AA"
  if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128 ? '#FFFFFF' : '#000000';
}
