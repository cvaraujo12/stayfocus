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
          hover: '#2563EB', // Azul mais escuro para hover
          focus: '#1D4ED8', // Azul ainda mais escuro para focus
          border: '#93C5FD', // Azul claro para bordas
        },
        autoconhecimento: {
          primary: '#6B7280', // Cinza azulado (calma, reflexão)
          secondary: '#9CA3AF',
          light: '#F9FAFB90', // Reduzida opacidade para suavizar
          hover: '#4B5563', // Versão mais escura para hover
        },
        // Cores específicas para autenticação com alto contraste e acessibilidade
        auth: {
          primary: '#2563EB', // Azul escuro para melhor contraste
          secondary: '#60A5FA',
          accent: '#F59E0B', // Amarelo âmbar para destaques
          error: '#DC2626', // Vermelho para erros
          success: '#059669', // Verde para sucesso
          border: '#E5E7EB',
          text: {
            primary: '#111827',
            secondary: '#4B5563',
            muted: '#6B7280',
          },
          background: {
            primary: '#FFFFFF',
            secondary: '#F9FAFB',
            muted: '#F3F4F6',
          }
        }
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
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'auth': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
