/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Kwanza" — verde-petróleo profundo, evoca o rio e a moeda; substitui o verde genérico
        // de template. Usado como cor de marca principal (botões, links, cabeçalhos escuros).
        xkwanza: {
          50: '#F0FAF7',
          100: '#DBF2EA',
          200: '#B4E4D4',
          300: '#7ECEB6',
          400: '#47AD91',
          500: '#268F76',
          600: '#14735E',
          700: '#105B4B',
          800: '#0D4A3E',
          900: '#0A3830',
          950: '#062420',
        },
        // "Ouro" — dourado quente (valor, conquista, selo de confiança), mais rico que o âmbar
        // genérico do Tailwind.
        gold: {
          50: '#FFF8EB',
          100: '#FEEBC3',
          200: '#FDD888',
          300: '#FBC24C',
          400: '#F3AC24',
          500: '#DE8F13',
          600: '#B96F0D',
          700: '#94540D',
          800: '#78430F',
          900: '#633810',
        },
        // "Terra" — terracota/argila, usado com moderação para calor (tags, ilustrações,
        // estados de atenção suaves) — nunca como cor de acção primária.
        terra: {
          50: '#FDF4F1',
          100: '#FAE3DA',
          400: '#D97D56',
          500: '#C1602F',
          600: '#A44A22',
        },
      },
      fontFamily: {
        sans: ['"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
