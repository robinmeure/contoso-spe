import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        server: {
            host: true,
            port: parseInt(process.env.PORT ?? "5173"),
            proxy: {
                '/api': {
                    target: process.env.services__backend__http__0 || process.env.services__backend__http__0,
                    changeOrigin: true,
                    rewrite: path => path.replace(/^\/api/, ''),
                    secure: false
                }
            }
        },
        define: {
            'process.env': env
        },
    };
}); 