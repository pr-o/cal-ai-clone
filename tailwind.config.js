/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Light mode backgrounds
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F5F5F5',
        // Dark mode backgrounds (used with dark: prefix)
        'dark-primary': '#111111',
        'dark-secondary': '#1E1E1E',
        // Text
        'text-primary': '#000000',
        'text-secondary': '#666666',
        'text-dark-primary': '#FFFFFF',
        'text-dark-secondary': '#999999',
        // Borders
        border: '#E5E5E5',
        'border-dark': '#2A2A2A',
        // Accent
        'accent-orange': '#FF5500',
        // Macros
        'macro-protein': '#FF6B35',
        'macro-carbs': '#FFB800',
        'macro-fat': '#4A9EFF',
        // Health score
        'health-green': '#4CAF50',
      },
      fontFamily: {
        black: ['Inter_900Black'],
        bold: ['Inter_700Bold'],
        semibold: ['Inter_600SemiBold'],
        medium: ['Inter_500Medium'],
        regular: ['Inter_400Regular'],
      },
    },
  },
  plugins: [],
};
