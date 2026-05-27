import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: {
    allowedHosts: [
      'inner-focusing-remedy-invitations.trycloudflare.com',
      'antivirus-rhode-cape-neck.trycloudflare.com'
    ],
  },
})