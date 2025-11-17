import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    root: path.resolve(__dirname, '.'),
    plugins: [react()],
    publicDir: 'public',
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            vendor_three: ['three'],
            vendor_react: [
              'react',
              'react-dom',
              'react-router',
              'react-router-dom',
            ],
            vendor_3d: ['@react-three/fiber', '@react-three/drei'],
            vendor_web3: ['axios', 'web3'],
          },
        },
      },
    },
    assetsInclude: [
      '**/*.jpg',
      '**/*.png',
      '**/*.glb',
      '**/*.jpeg',
      '**/*.webp',
      '**/*.svg',
      '**/*.gif',
    ],
    server: {
      port: 12021,
      open: true,
      host: true,
      strictPort: true,
      historyApiFallback: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      'process.env.VITE_ALCHEMY_API_KEY': JSON.stringify(
        env.VITE_ALCHEMY_API_KEY
      ),
      'process.env.VITE_INFURA_API_KEY': JSON.stringify(
        env.VITE_INFURA_API_KEY
      ),
      'process.env.VITE_ANKR_API_KEY': JSON.stringify(env.VITE_ANKR_API_KEY),
      'process.env.VITE_SUBGRAPH_API_KEY': JSON.stringify(
        env.VITE_SUBGRAPH_API_KEY
      ),
      'process.env.CONTRACT_ADDRESS': JSON.stringify(env.CONTRACT_ADDRESS),
      'process.env.OPEN_ROUTER_API_KEY': JSON.stringify(
        env.OPEN_ROUTER_API_KEY
      ),
      'process.env.STABILITY_API_KEY': JSON.stringify(env.STABILITY_API_KEY),
      'process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY': JSON.stringify(
        env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
      ),
      'process.env.CONTRACT_QUIZ_ADDRESS': JSON.stringify(
        env.CONTRACT_QUIZ_ADDRESS
      ),
      'process.env.DEPLOYER_ADDRESS': JSON.stringify(env.DEPLOYER_ADDRESS),
      'process.env.CONTRACT_NFT_STAKING': JSON.stringify(
        env.CONTRACT_NFT_STAKING
      ),
      'process.env.BASE_URL': JSON.stringify('/'),
    },
  };
});
