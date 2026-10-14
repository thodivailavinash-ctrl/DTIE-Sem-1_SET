/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bgPrimary: '#070B18',
        bgSecondary: '#10182B',
        accentCyan: '#22D3EE',
        accentViolet: '#8B5CF6',
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#FB7185',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.25)',
        'neon-violet': '0 0 20px rgba(139, 92, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
