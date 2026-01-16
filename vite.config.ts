import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Escuta em todos os IPs (0.0.0.0)
        port: 3000,
        strictPort: true, // Falha se a porta 3000 estiver ocupada
    }
})
