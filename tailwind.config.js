/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores para cada seção, com contraste reduzido para evitar incômodo visual
        inicio: {
          primary: '#4F46E5', // Indigo
          secondary: '#818CF8',
          light: '#EEF2FF90', // Reduzida opacidade para suavizar
        },
        alimentacao: {
          primary: '#10B981', // Esmeralda
          secondary: '#34D399',
          light: '#ECFDF590', // Reduzida opacidade para suavizar
        },
        estudos: {
          primary: '#FF8C00', // Changed from Amber to a darker orange for better contrast
          secondary: '#FFB74D',
          light: '#FFF3E0', // Removed transparency for better contrast
          dark: '#E65100', // Added a dark version for dark mode
        },
        saude: {
          primary: '#EF4444', // Vermelho
          secondary: '#F87171',
          light: '#FEF2F290', // Reduzida opacidade para suavizar
        },
        lazer: {
          primary: '#8B5CF6', // Violeta
          secondary: '#A78BFA',
          light: '#F5F3FF90', // Reduzida opacidade para suavizar
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
