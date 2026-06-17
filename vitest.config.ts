import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".lovable", "src/routeTree.gen.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/sla.ts",
        "src/lib/reports/**",
        "src/lib/channels/**",
        "src/lib/notifications/**",
        "src/lib/campaigns/**",
        "src/lib/developer/**",
        "src/lib/ai/**",
        "src/lib/automation/**",
      ],
      exclude: ["**/*.test.ts", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});