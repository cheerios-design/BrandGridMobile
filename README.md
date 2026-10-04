# Overview

As a software engineer, I wanted to deepen my understanding of cross-platform mobile development by building a real tool with React Native, TypeScript, multi-screen navigation, and on-device data persistence.

BrandGrid Mobile is a brand guideline and color inspection tool for digital designers. The Home screen displays the active brand palette as a 3x3 grid. Tap any cell to inspect its hex code and see whether black or white text is more readable on it. Tap **Open Palette Library** to switch to the Palette Library screen, where you can pick any saved palette to make it active, edit its name and nine hex codes (invalid codes are highlighted in red), save changes, save a copy as a new palette, or delete a palette. Palettes and the active selection are stored with AsyncStorage, so they are still there after the app is closed or the device restarts.

I built this app to give designers a quick, pocket-sized way to check how a set of brand colors works together, and to practice state management, navigation, and local storage in a mobile app.

[Software Demo Video](https://drive.google.com/file/d/1AUIMeOXzl-EyTH2h7HplPHxeggFWFfT5/view?usp=sharing)

# Development Environment

The app was developed in the Antigravity IDE using Expo (Expo Go and the Expo CLI) to run and test it on a phone and in the browser. Node.js and npm were used to manage packages.

The app is written in TypeScript (strict mode) with React Native. Libraries used:
* React Navigation (`@react-navigation/native`, `@react-navigation/native-stack`) for moving between screens
* `@react-native-async-storage/async-storage` for saving palettes on the device
* `react-native-screens` and `react-native-safe-area-context` (required by React Navigation)

# Useful Websites

* [React Native Documentation](https://reactnative.dev/docs/getting-started)
* [Expo Documentation](https://docs.expo.dev/)
* [React Navigation](https://reactnavigation.org/)
* [Async Storage Documentation](https://react-native-async-storage.github.io/async-storage/)
* [TypeScript Handbook](https://www.typescriptlang.org/docs/)

# Future Work

* Add a color picker so users do not have to type hex codes by hand
* Show WCAG contrast ratios between pairs of palette colors
* Export and share palettes as an image or JSON file
