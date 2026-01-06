import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { copyFileSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-manifest",
      closeBundle() {
        // Copy manifest.json to dist folder after build
        copyFileSync(
          resolve(__dirname, "manifest.json"),
          resolve(__dirname, "dist/manifest.json")
        );
      },
    },
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        content: "src/contentScript.tsx",
        background: "src/background.ts",
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "content") return "src/contentScript.js";
          if (chunk.name === "background") return "background.js";
          return "assets/[name].js";
        },
        // Ensure CSS is bundled properly
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "styles.css") return "src/styles.css";
          return "assets/[name].[ext]";
        },
      },
    },
  },
});


