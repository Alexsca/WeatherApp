/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages the app is served from https://<user>.github.io/WeatherApp/,
// so the production build needs that sub-path as its base. Dev/preview use "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/WeatherApp/" : "/",
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
}));
