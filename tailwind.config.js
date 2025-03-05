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
        financas: {
          primary: '#0EA5E9', // Azul céu
          secondary: '#38BDF8',
          light: '#E0F2FE90', // Reduzida opacidade para suavizar
        },
        hiperfocos: {
          primary: '#F97316', // Laranja intenso
          secondary: '#FB923C',
          light: '#FFF7ED90', // Reduzida opacidade para suavizar
        },
        sono: {
          primary: '#5D4DB2', // Roxo azulado (lembrando noite)
          secondary: '#7B6DC3',
          light: '#EDE9FF90', // Reduzida opacidade para suavizar
        },
        perfil: {
          primary: '#3B82F6', // Azul (representando identidade/personalização)
          secondary: '#60A5FA',
          light: '#EFF6FF90', // Reduzida opacidade para suavizar
        },
        autoconhecimento: {
          primary: '#6B7280', // Cinza azulado (calma, reflexão)
          secondary: '#9CA3AF',
          light: '#F9FAFB90', // Reduzida opacidade para suavizar
          hover: '#4B5563', // Versão mais escura para hover
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
