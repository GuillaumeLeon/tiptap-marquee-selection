import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "unplugin-dts/vite";

export default defineConfig({
  plugins: [dts()],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "TiptapMarqueeSelection",
      fileName: "tiptap-marquee-selection",
    },
    rolldownOptions: {
      external: (id) =>
        id === "@tiptap/core" ||
        id.startsWith("@tiptap/") ||
        id.startsWith("prosemirror-"),
    },
  },
});
