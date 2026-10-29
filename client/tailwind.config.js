/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sphere: {
          charcoal: '#17191C',
          cream: '#F8F8F5',
          violet: '#7657F6',
          'violet-light': '#EEE9FF',
          'violet-dark': '#5B3EDB',
          mint: '#DDF7EA',
          amber: '#F59E0B',
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(23, 25, 28, 0.06)',
        'glow': '0 0 25px -5px rgba(118, 87, 246, 0.35)',
      }
    },
  },
  plugins: [],
}
