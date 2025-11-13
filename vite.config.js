import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: "./index.html"
    }
  },
  optimizeDeps: {
    include: ["ethers", "@walletconnect/web3-provider"]
  },
  server: {
    port: 5173
  }
});
