/**
 * Type definitions for the BrandGrid Mobile application.
 */

/** Routes available in the stack navigator (no route params needed). */
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

/** A named brand palette containing exactly 9 hex colors for the 3x3 grid. */
export interface Palette {
  id: string;
  name: string;
  colors: string[];
}
