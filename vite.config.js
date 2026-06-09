import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [
        react({
            include: /resources\/js\/.*\.tsx$/,
        }),
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/dashboard.tsx',
            ],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
                bunny('JetBrains Mono', {
                    weights: [400, 500],
                }),
            ],
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: false,
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
