/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'queue-safe': '#3B82F6',
        'queue-warning': '#F59E0B',
        'queue-danger': '#EF4444',
        'queue-buffer': '#E5E7EB',
      },
      animation: {
        'pulse-warning': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
