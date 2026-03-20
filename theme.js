/**
 * theme.js — Showoffy shared theme utility
 *
 * Usage:  import { applyTheme, toggleTheme, getTheme } from "./theme.js";
 *
 * Call applyTheme() as early as possible in <head> (via an inline script or
 * at the top of each page's module) to prevent a flash of wrong theme.
 */

const STORAGE_KEY = "showoffy_theme";

/** Returns the current theme preference: "dark" | "light" */
export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) || "dark";
}

/** Applies the stored theme to <html data-theme="..."> */
export function applyTheme(override) {
  const theme = override || getTheme();
  document.documentElement.setAttribute("data-theme", theme);
}

/** Persists a theme choice and applies it immediately */
export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

/** Flips between light and dark */
export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

// Auto-apply on module load so every page that imports this is immediately themed
applyTheme();
